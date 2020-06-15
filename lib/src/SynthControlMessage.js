import { Logger } from 'log-count';
import isString from 'is-string';
import isArray from 'isarray';
import isObject from 'is-object';

import privateSet from './privateSet';
import { mathsOps, unaryOps } from './mathsOperations';
import displayNumber from './displayNumber';

// Make a function to display a decimal or integer number as a string
// with target length of 9 characters
const dn = displayNumber(9);

let id = 1;
class SynthControlMessage {
  constructor(...paramArray) {
    const param0 = paramArray[0];
    const param1 = paramArray[1];
    const scmIsInputted = param0 instanceof SynthControlMessage;
    const scm = scmIsInputted ? param0 : {};
    let data = scmIsInputted ? param1 : param0;
    if (!isObject(data)) data = {};

    this.id = id;
    id += 1;
    this.tg = '1'; // location tag
    this.pr = ''; // param, string
    this.ms = null; // milliseconds, positive decimal
    this.bt = null; // beats, positive decimal
    this.vs = null; // value at start, any decimal
    this.ve = null; // value at end, any decimal
    this.cch = {}; // cached values, not frozen, can later store temp or transient data here

    if (scm && scm.logger && isObject(scm.logger) && scm.logger.isLogger) {
      this.logger = scm.logger;
    } else {
      const { logger } = data;
      if (logger && isObject(logger) && logger.isLogger) this.logger = logger;
    }

    // privateSet(this, <key>, array, fn) goes through array and assigns this.<key> to the
    // first valid value in the array, according to fn at the end.
    // If no value in array is valid, privateSet does nothing.
    privateSet(this, 'tg', [data.tag, scm.tag], (v) => isString(v));
    privateSet(this, 'pr', [data.p, data.pr, data.param, scm.pr], (v) => isString(v));
    privateSet(this, 'ms', [data.m, data.ms, data.milliseconds, scm.ms], (v) => Number.isFinite(v) && v > 0);
    privateSet(this, 'bt', [data.b, data.bt, data.bts, data.beats, scm.bt], (v) => Number.isFinite(v) && v > 0);
    privateSet(this, 'vs', [data.vs, data.vS, data.start, data.valStart, data.valueStart, data.v, data.val, data.value, scm.vs, 0], (v) => Number.isFinite(v));
    privateSet(this, 've', [data.ve, data.vE, data.end, data.valEnd, data.valueEnd, data.v, data.val, data.value, scm.ve, this.vs, 0], (v) => Number.isFinite(v));

    // Want either beats (default) or milliseconds to be positive number, but not both
    if (this.isExactTime && Number.isFinite(this.bt)) this.bt = null; // milliseconds take precedence over beats
    if (!this.isExactTime && !Number.isFinite(this.bt)) this.bt = 1; // if no timing information supplied, set beats to 1

    // Logger is mandatory, make sure it is present
    if (!this.logger) this.logger = new Logger();
    // Make sure the object (except for this.cch) can never change again
    Object.freeze(this);
    this.logger.trace('New SCM created:');
    this.logger.trace({ obj: this });
  }

  get tag() { return this.tg; }

  get param() { return this.pr; }

  get milliseconds() { return this.ms || 0; } // will be numeric, not null

  get beats() { return this.bt || 0; } // will be numeric, not null

  get val() { return this.vs; }

  get value() { return this.vs; }

  get vS() { return this.vs; }

  get start() { return this.vs; }

  get valStart() { return this.vs; }

  get valueStart() { return this.vs; }

  get end() { return this.ve; }

  get valEnd() { return this.ve; }

  get valueEnd() { return this.ve; }

  get isExactTime() { return Number.isFinite(this.ms); }

  get isConstant() { return this.vs === this.ve; }

  get isParallel() { return false; }

  setTimeStart(tStart, tMult = 1) {
    if (Number.isFinite(tStart) && Number.isFinite(tMult) && tMult > 0) {
      this.cch.t0 = tStart;
      this.cch.t1 = tStart + tMult * this.duration;
    }
    return this;
  }

  get isTimeSet() { return Number.isFinite(this.cch.t0); }

  get timeStart() { return this.isTimeSet ? this.cch.t0 : 0; }

  get timeEnd() { return this.isTimeSet ? this.cch.t1 : this.duration; }

  setActualMs(inputMs, inputFract) {
    // Do linear interpolation on values, based on inputFract
    // Default to original values (actualFract = 1)
    const actualFract = (Number.isFinite(inputFract) && inputFract >= 0 && inputFract <= 1) ? inputFract : 1;
    // Set actual milliseconds based on: 1) inputMs, 2) this.milliseconds
    const actualMs = (Number.isFinite(inputMs) && inputMs >= 0) ? inputMs : this.milliseconds;
    this.cch.ms = actualMs;
    this.cch.vs = this.vs;
    this.cch.ve = (1 - actualFract) * this.vs + actualFract * this.ve;
    const zT = (actualMs <= 0) ? ' // ' : '';
    this.logger.trace(`${this.tag}:  ${zT}update param '${this.param}' for ${this.isExactTime ? `${dn(this.milliseconds)} ms` : `${dn(this.beats)} beat${this.beats === 1 ? '' : 's'}`} [${dn(actualMs)} ms] from ${dn(this.cch.vs)} to ${dn(this.cch.ve)}${zT}`);
  }

  get actualMs() { return this.cch.ms; } // Going to filter to only 0 < scm.actualMs

  calculateTiming(inputStartTimeS) {
    // Returns an end time
    // These times Audio Context times, all in seconds
    if (!(Number.isFinite(this.cch.ms) && Number.isFinite(inputStartTimeS))) return 0;
    const endTimeS = inputStartTimeS + 0.001 * this.cch.ms;
    const zT = (this.cch.ms <= 0) ? ' // ' : '';
    this.logger.trace(`${this.tag}:  ${zT}${this.param} ${dn(inputStartTimeS)} s to ${dn(endTimeS)} s${(zT) ? '' : `, from ${dn(this.cch.vs)} to ${dn(this.cch.ve)}`}${zT}`);
    this.cch.ts = inputStartTimeS;
    this.cch.te = endTimeS;
    return endTimeS;
  }


  // Perform a general transformation of this SCM using supplied data
  // data object format is {type: 'theType', ...otherData}
  // or [...data objects] to apply a sequence of maps
  map(data) {
    this.logger.debug(`SCM map on id ${this.id}, param ${this.param}, data ${JSON.stringify(data)}`);
    if (isArray(data)) { // Treat data as array of map objects
      if (data.length === 0) return this;
      if (data.length === 1) return this.map(data[0]);
      return this.map(data[0]).map(data.slice(1));
    } if (isObject(data)) {
      switch (data.type) {
        case 'prefixParam':
          return this.prefixParam(data);
        case 'value':
          return this.mapValue(data);
        default:
          return this;
      }
    }
    return this;
  }

  // Rename parameter by prefixing with a string
  prefixParam(data) {
    this.logger.trace(`SCM prefixParam on id ${this.id}, param ${this.param}, data ${JSON.stringify(data)}`);
    if (isObject(data)) {
      if (isString(data.prefix) && data.prefix.length > 0) {
        const newParam = data.prefix + this.param;
        this.logger.trace(`Prefix succeeded, from ${this.param} to ${newParam}`);
        return new this.constructor(this, { pr: newParam });
      }
    }
    this.logger.warn('Prefix failed');
    return this;
  }

  // Perform maths operation on start and end values
  mapValue(data) {
    this.logger.trace(`SCM mapValue on id ${this.id}, param ${this.param}, data ${JSON.stringify(data)}`);
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) {
          this.logger.trace('Param doesnt match');
          return this;
        }
      }
      const { op, num } = data;
      const mathsOp = mathsOps[op];
      if (mathsOp && (unaryOps[op] || Number.isFinite(num))) {
        this.logger.trace('Map Value succeeded');
        return new this.constructor(this, { vs: mathsOp(this.vs, num), ve: mathsOp(this.ve, num) });
      }
    }
    this.logger.warn('Map Value failed on SCM and data:');
    this.logger.warn({ obj: this });
    this.logger.warn({ obj: data });
    return this;
  }

  toString() {
    let valueText;
    let durationText;
    // let timeText = '';
    if (this.isConstant) {
      valueText = `value ${dn(this.vs)}`;
    } else {
      valueText = `values ${dn(this.vs)} to ${dn(this.ve)}`;
    }
    if (this.isExactTime) {
      durationText = `time ${dn(this.milliseconds)} ms`;
    } else {
      durationText = `duration ${dn(this.beats)} beat${this.beats === 1 ? '' : 's'}`;
    }
    // if (this.isTimeSet) {
    //   timeText = `, time from ${dn(this.timeStart)} s to ${dn(this.timeEnd)} s`;
    // }
    return `SynthControlMessage: param '${this.param}', ${durationText}, ${valueText}`;
    // return `SynthControlMessage: param '${this.param}', ${durationText}, ${valueText}${timeText}`;
  }
}

export default SynthControlMessage;

import isString from 'is-string';
import isArray from 'isarray';
import isObject from 'is-object';

import privateSet from './privateSet';
import { mathOps, unaryOps } from './mathsOperations';
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
    this.pr = ''; // param, string
    this.ms = null // milliseconds, positive decimal
    this.bt = null // beats, positive decimal
    this.vs = null // value at start, any decimal
    this.ve = null // value at end, any decimal
    this.cch = {}; // cached values, not frozen, can later store temp or transient data here

    // privateSet(this, <key>, array, fn) goes through array and assigns this.<key> to the
    // first valid value in the array, according to fn at the end.
    // If no value in array is valid, privateSet does nothing.
    privateSet(this, 'pr', [data.p, data.pr, data.param, scm.pr], (v) => isString(v));
    privateSet(this, 'ms', [data.m, data.ms, data.milliseconds, scm.ms], (v) => Number.isFinite(v) && v > 0);
    privateSet(this, 'bt', [data.b, data.bt, data.bts, data.beats, scm.bt], (v) => Number.isFinite(v) && v > 0);
    privateSet(this, 'vs', [data.vs, data.vS, data.start, data.valStart, data.valueStart, data.v, data.val, data.value, scm.vs, 0], (v) => Number.isFinite(v));
    privateSet(this, 've', [data.ve, data.vE, data.end, data.valEnd, data.valueEnd, data.v, data.val, data.value, scm.ve, this.vs, 0], (v) => Number.isFinite(v));

    // Want either beats (default) or milliseconds to be positive number, but not both
    if (Number.isFinite(this.ms) && Number.isFinite(this.bt)) this.bt = null // milliseconds take precedence over beats
    if (!Number.isFinite(this.ms) && !Number.isFinite(this.bt)) this.bt = 1 // if no timing information supplied, set beats to 1

    // Make sure the object (except for this.cch) can never change again
    Object.freeze(this);
  }

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

  get isExactTime() { return Number.isFinite(this.ms) }

  get isConstant() { return this.vs === this.ve; }

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

  // Perform a general transformation of this SCM using supplied data
  // data object format is {type: 'theType', ...otherData}
  // or [...data objects] to apply a sequence of maps
  map(data) {
    if (isArray(data)) {
      // Treat data as array of map objects
      if (data.length === 0) return this;
      if (data.length === 1) return this.map(data[0]);
      return this.map(data[0]).map(data.slice(1));
    }
    if (isObject(data)) {
      switch (data.type) {
        case 'rename':
          return this.rename(data);
        case 'value':
          return this.mapValue(data);
        case 'flip':
          return this.mapFlip(data);
        default:
        // Not matched the map function, return same object
      }
    }
    return this;
  }

  // Rename parameter from old to new value
  rename(data) {
    if (isObject(data)) {
      if (data.old === this.param && isString(data.new) && data.new.length > 0) {
        return new this.constructor(this, { pr: data.new });
      }
    }
    return this;
  }

  // Perform maths operation on start and end values
  mapValue(data) {
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) return this;
      }
      const dataOp = data.op;
      const mathOp = mathOps[dataOp];
      const { num } = data;
      if (mathOp && (unaryOps[dataOp] || Number.isFinite(num))) {
        return new this.constructor(this, { vs: mathOp(this.vs, num), ve: mathOp(this.ve, num) });
      }
    }
    return this;
  }

  // If start and end values are different, return new SCM with those values swapped / flipped
  mapFlip(data) {
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) return this;
      }
      if (this.isConstant) return this;
      return new this.constructor(this, { vs: this.ve, ve: this.vs });
    }
    return this;
  }

  toString() {
    let valueText;
    let durationText;
    let timeText = '';
    if (this.isConstant) {
      valueText = `value ${dn(this.vs)}`;
    } else {
      valueText = `values ${dn(this.vs)} to ${dn(this.ve)}`;
    }
    if (this.isExactTime) {
      durationText = `time ${dn(this.milliseconds)} ms`;
    } else {
      durationText = `duration ${dn(this.beats)} beats`;
    }
    if (this.isTimeSet) {
      timeText = `, time from ${dn(this.timeStart)} s to ${dn(this.timeEnd)} s`;
    }
    return `SynthControlMessage: param '${this.param}', ${durationText}, ${valueText}${timeText}`;
  }
}

export default SynthControlMessage;

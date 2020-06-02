import isString from 'is-string';
import isArray from 'isarray';
import isObject from 'is-object';

import privateSet from './privateSet';
import { mathOps, unaryOps } from './mathsOperations';
import displayNumber from './displayNumber';

// Make a function to display a decimal or integer number as a string
// with target length of 9 characters
const dn = displayNumber(9);

let id = 0;
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
    this.p = ''; // this.param
    this.d = 0; // this.duration
    this.v = 0; // this.value
    this.vE = 0; // this.valueEnd
    this.c = {}; // can later store any cached / temp / transient data here
    // Below, privateSet does nothing if all values in array are invalid
    privateSet(this, 'p', [data.p, data.param, scm.p], (v) => isString(v));
    privateSet(this, 'd', [data.d, data.dur, data.duration, scm.d], (v) => Number.isFinite(v) && v >= 0);
    privateSet(this, 'v', [data.vS, data.start, data.valStart, data.valueStart, data.v, data.val, data.value, scm.v], (v) => Number.isFinite(v));
    // this.vE defaults to this.v if not otherwise specified
    privateSet(this, 'vE', [data.vE, data.end, data.valEnd, data.valueEnd, data.v, data.val, data.value, scm.vE, this.v], (v) => Number.isFinite(v));
    Object.freeze(this);
  }

  get param() { return this.p; }

  get dur() { return this.d; }

  get duration() { return this.d; }

  get val() { return this.v; }

  get value() { return this.v; }

  get start() { return this.v; }

  get vS() { return this.v; }

  get valStart() { return this.v; }

  get valueStart() { return this.v; }

  get end() { return this.vE; }

  get valEnd() { return this.vE; }

  get valueEnd() { return this.vE; }

  get isConstant() { return this.v === this.vE; }

  setStartTime(t) {
    if (Number.isFinite(t)) {
      this.c.t0 = t;
      this.c.t1 = t + this.duration;
    }
    return this;
  }

  get hasTimeSet() { return Number.isFinite(this.c.t0); }

  get startTime() { return this.hasTimeSet ? this.c.t0 : 0; }

  get endTime() { return this.hasTimeSet ? this.c.t1 : this.duration; }

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
        case 'duration':
          return this.mapDuration(data);
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
        return new this.constructor(this, { p: data.new });
      }
    }
    return this;
  }

  // Perform maths operation on duration
  mapDuration(data) {
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) return this;
      }
      const dataOp = data.op;
      const mathOp = mathOps[dataOp];
      const { num } = data;
      if (mathOp && (unaryOps[dataOp] || Number.isFinite(num))) {
        return new this.constructor(this, { d: mathOp(this.d, num) });
      }
    }
    return this;
  }

  // Perform maths operation on value (and valueEnd if defined)
  mapValue(data) {
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) return this;
      }
      const dataOp = data.op;
      const mathOp = mathOps[dataOp];
      const { num } = data;
      if (mathOp && (unaryOps[dataOp] || Number.isFinite(num))) {
        return new this.constructor(this, { v: mathOp(this.v, num), vE: mathOp(this.vE, num) });
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
      return new this.constructor(this, { v: this.vE, vE: this.v });
    }
    return this;
  }

  toString() {
    let valueText; let
      durationText;
    if (this.isConstant) {
      valueText = `value ${dn(this.v)}`;
    } else {
      valueText = `values ${dn(this.v)} to ${dn(this.vE)}`;
    }
    if (this.hasTimeSet) {
      durationText = `time ${dn(this.startTime)} to ${dn(this.endTime)} (duration ${dn(this.duration)})`;
    } else {
      durationText = `duration ${dn(this.duration)}`;
    }
    return `SynthControlMessage: param '${this.param}', ${durationText}, ${valueText}`;
  }
}

export default SynthControlMessage;

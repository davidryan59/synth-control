import isArray from 'isarray';
import isObject from 'is-object';
import isString from 'is-string';

import privateSet from './privateSet';
import mathOps from './mathOps';

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
    this.l = 0; // this.length
    this.v = 0; // this.value
    // this.vE to be undefined, unless specified in construction data
    privateSet(this, 'p', [data.p, data.param, scm.p], (v) => isString(v));
    privateSet(this, 'l', [data.l, data.len, data.length, scm.l], (v) => Number.isFinite(v) && v >= 0);
    privateSet(this, 'v', [data.v, data.val, data.value, data.start, data.vS, data.valStart, data.valueStart, scm.v], (v) => Number.isFinite(v));
    privateSet(this, 'vE', [data.vE, data.end, data.valEnd, data.valueEnd, scm.vE], (v) => Number.isFinite(v));
    Object.freeze(this);
  }

  get param() { return this.p; }

  get len() { return this.l; }

  get length() { return this.l; }

  get val() { return this.v; }

  get value() { return this.v; }

  get start() { return this.v; }

  get vS() { return this.v; }

  get valStart() { return this.v; }

  get valueStart() { return this.v; }

  get end() { return this.vE; }

  get valEnd() { return this.vE; }

  get valueEnd() { return this.vE; }

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
        case 'length':
          return this.mapLength(data);
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

  // Perform maths operation on length
  mapLength(data) {
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) return this;
      }
      const mathOp = mathOps[data.op];
      const { num } = data;
      if (mathOp && Number.isFinite(num)) {
        return new this.constructor(this, { l: mathOp(this.l, num) });
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
      const mathOp = mathOps[data.op];
      const { num } = data;
      if (mathOp && Number.isFinite(num)) {
        if (Number.isFinite(this.vE)) {
          return new this.constructor(this, { v: mathOp(this.v, num), vE: mathOp(this.vE, num) });
        }
        return new this.constructor(this, { v: mathOp(this.v, num) });
      }
    }
    return this;
  }

  // Perform maths operation on length
  mapFlip(data) {
    if (isObject(data)) {
      if (isArray(data.params)) {
        if (!data.params.includes(this.param)) return this;
      }
      if (!Number.isFinite(this.vE)) return this;
      return new this.constructor(this, { v: this.vE, vE: this.v });
    }
    return this;
  }

  toString() {
    let valueText;
    if (this.valueEnd) {
      valueText = `values ${this.value} to ${this.valueEnd}`;
    } else {
      valueText = `value ${this.value}`;
    }
    return `SynthControlMessage: param '${this.param}', length ${this.length}, ${valueText}`;
  }
}

export default SynthControlMessage;

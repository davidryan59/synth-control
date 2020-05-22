import isObject from 'is-object';
import isString from 'is-string';
import isFunction from 'is-function';

import privateSet from './privateSet';


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

  mapValue(data) {
    if (isObject(data)) {
      const mapFn = data.fn;
      if (isFunction(mapFn)) {
        if (Number.isFinite(this.valueEnd)) {
          const newVS = mapFn(this.value);
          const newVE = mapFn(this.valueEnd);
          if (Number.isFinite(newVS) && Number.isFinite(newVE)) {
            return new this.constructor(this, { v: newVS, vE: newVE });
          }
        } else {
          const newV = mapFn(this.value);
          if (Number.isFinite(newV)) {
            return new this.constructor(this, { v: newV });
          }
        }
      }
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

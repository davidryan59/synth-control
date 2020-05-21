import isObject from 'is-object';
import isString from 'is-string';
import isFunction from 'is-function';

import privateSet from './privateSet';


let id = 0;
class SynthControlMessage {
  constructor(data) {
    this.id = id;
    id += 1;
    this.p = ''; // this.param
    this.l = 0; // this.length
    this.v = 0; // this.value
    if (isObject(data)) {
      privateSet(this, 'p', [data.p, data.param], (v) => isString(v));
      privateSet(this, 'l', [data.l, data.len, data.length], (v) => Number.isFinite(v) && v >= 0);
      privateSet(this, 'v', [data.v, data.val, data.value, data.start, data.vS, data.valStart, data.valueStart], (v) => Number.isFinite(v));
      privateSet(this, 'vE', [data.vE, data.end, data.valEnd, data.valueEnd], (v) => Number.isFinite(v));
    }
    Object.freeze(this);
  }

  get param() { return this.p; }

  get length() { return this.l; }

  get value() { return this.v; }

  get valueEnd() { return this.vE; }

  mapValue(data) {
    if (isObject(data)) {
      const mapFn = data.fn;
      if (isFunction(mapFn)) {
        if (Number.isFinite(this.valueEnd)) {
          const newValue = mapFn(this.value);
          const newValueEnd = mapFn(this.valueEnd);
          if (Number.isFinite(newValue) && Number.isFinite(newValueEnd)) {
            return new this.constructor({
              p: this.param,
              l: this.length,
              v: newValue,
              vE: newValueEnd,
            });
          }
        } else {
          const newValue = mapFn(this.value);
          if (Number.isFinite(newValue)) {
            return new this.constructor({
              p: this.param,
              l: this.length,
              v: newValue,
            });
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

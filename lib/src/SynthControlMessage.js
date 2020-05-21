import isObject from 'is-object';
import isString from 'is-string';

import privateSet from './privateSet';


let id = 0;
class SynthControlMessage {
  constructor(data = {}) {
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

  toString() { return `SynthControlMessage: param '${this.param}', length ${this.length}, value ${this.value}`; }
}

export default SynthControlMessage;

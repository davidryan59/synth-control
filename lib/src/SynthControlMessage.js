import isObject from 'is-object';
import isString from 'is-string';

let id = 0;
class SynthControlMessage {
  constructor(data = {}) {
    this.id = id;
    id += 1;
    this.p = ''; // this.param
    this.l = 0; // this.length
    this.v = 0; // this.value
    if (isObject(data)) {
      // Deal with p / param
      const dataP = data.p;
      const dataParam = data.param;
      if (isString(dataP)) {
        this.p = dataP;
      } else if (isString(dataParam)) {
        this.p = dataParam;
      }
      // Deal with l / length
      const dataL = data.l;
      const dataLength = data.length;
      if (Number.isFinite(dataL) && dataL >= 0) {
        this.l = dataL;
      } else if (Number.isFinite(dataLength) && dataLength >= 0) {
        this.l = dataLength;
      }
      // Deal with v / value
      const dataV = data.v;
      const dataValue = data.value;
      if (Number.isFinite(dataV)) {
        this.v = dataV;
      } else if (Number.isFinite(dataValue)) {
        this.v = dataValue;
      }
    }
    Object.freeze(this);
  }

  get param() { return this.p; }

  get length() { return this.l; }

  get value() { return this.v; }

  toString() { return `SynthControlMessage: param '${this.param}', length ${this.length}, value ${this.value}`; }
}

export default SynthControlMessage;

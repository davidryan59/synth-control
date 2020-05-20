import isArray from 'isarray';

import SynthControlMessage from './SynthControlMessage';

let id = 0;
class SynthControlArray {
  constructor(data = []) {
    this.id = id;
    id += 1;
    if (isArray(data)) {
      // Deal with data here
      const len = data.length;
      this.array = new Array(len);
      for (let i = 0; i < len; i += 1) {
        const item = data[i];
        this.array[i] = item instanceof SynthControlMessage ? item : new SynthControlMessage(item);
      }
    } else {
      this.array = [];
    }
    Object.freeze(this.array);
    Object.freeze(this);
  }

  get length() { return this.array.length; }

  filter(param) { return new this.constructor(this.array.filter((scm) => scm.param === param)); }

  toString() { return `SynthControlArray: length ${this.length}`; }
}

export default SynthControlArray;

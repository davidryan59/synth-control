import isArray from 'isarray';

import SynthControlMessage from './SynthControlMessage';

const toStringMaxItems = 5;

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

  toString() {
    let scmArray;
    let lastScm = null;
    let txt = `SynthControlArray, length ${this.length}${this.length ? ':' : ''}`;
    if (this.length < toStringMaxItems) {
      scmArray = this.array;
    } else {
      scmArray = this.array.slice(0, toStringMaxItems - 1);
      lastScm = this.array[this.length - 1];
    }
    scmArray.forEach((scm) => { txt += `\n  ${scm}`; });
    if (lastScm) txt += `\n  ...\n  ${lastScm}`;
    return txt;
  }
}

export default SynthControlArray;

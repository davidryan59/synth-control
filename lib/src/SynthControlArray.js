import isObject from 'is-object';
import isArray from 'isarray';

import SynthControlMessage from './SynthControlMessage';

const toStringMaxItems = 5;

let id = 0;
class SynthControlArray {
  constructor(data) {
    this.id = id;
    id += 1;
    if (isArray(data)) {
      const len = data.length;
      this.array = new Array(len);
      let needsFlattening = false;
      for (let i = 0; i < len; i += 1) {
        const item = data[i];
        if (item instanceof SynthControlMessage) {
          this.array[i] = item;
        } else if (item instanceof SynthControlArray) {
          this.array[i] = item.array;
          needsFlattening = true;
        } else {
          this.array[i] = new SynthControlMessage(item);
        }
      }
      if (needsFlattening) this.array = this.array.flat();
    } else {
      this.array = [];
    }
    Object.freeze(this.array);
    Object.freeze(this);
  }

  get length() { return this.array.length; }

  get(idx) { return this.array[idx]; }

  // Perform a general transformation of the SCMs inside this SCA, using supplied data
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
      const ta = this.array;
      const Tc = this.constructor;
      const dp = data.params;
      switch (data.type) {
        case 'value':
        case 'length':
        case 'rename':
          return new Tc(ta.map((scm) => scm.map(data)));
        case 'keep':
          return isArray(dp) ? new Tc(ta.filter((scm) => dp.includes(scm.param))) : this;
        case 'remove':
          return isArray(dp) ? new Tc(ta.filter((scm) => !(dp.includes(scm.param)))) : this;
        case 'reverse':
          return new Tc([...ta].reverse());
        default:
        // Not matched the map function, return same object
      }
    }
    return this;
  }

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

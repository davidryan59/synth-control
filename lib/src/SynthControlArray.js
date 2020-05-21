import isObject from 'is-object';
import isFunction from 'is-function';
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

  filter(data) {
    if (isObject(data)) {
      const paramArray = data.params;
      if (isArray(paramArray)) {
        return new this.constructor(this.array.filter((scm) => paramArray.includes(scm.param)));
      }
    }
    return this;
  }

  mapValues(data) {
    if (isObject(data)) {
      const paramArray = data.params;
      const fnToTransform = data.fn;
      if (isArray(paramArray) && isFunction(fnToTransform)) {
        return new this.constructor(this.array.map((scm) => {
          if (paramArray.includes(scm.param)) {
            return scm.mapValue(data);
          }
          return scm;
        }));
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

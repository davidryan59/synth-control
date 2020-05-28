import isArray from 'isarray';
import isObject from 'is-object';

import SynthControlMessage from './SynthControlMessage';

const toStringMaxItems = 5;

let id = 0;
class SynthControlArray {
  constructor(data) {
    this.id = id;
    id += 1;
    this.array = [];
    if (isArray(data)) {
      // Treat data array as set of items to concatenate
      const len = data.length;
      this.array = new Array(len);
      for (let i = 0; i < len; i += 1) {
        const item = data[i];
        if (item instanceof SynthControlMessage) {
          this.array[i] = item;
        } else if (item instanceof SynthControlArray) {
          this.array[i] = item.array;
        } else {
          this.array[i] = new SynthControlMessage(item);
        }
      }
    } else if (isObject(data)) {
      // Treat data object as a library lookup
      // Will construct item data.label from data.library
      const { library } = data;
      if (isObject(library)) {
        const thisConstructionData = library[data.label];
        if (isObject(thisConstructionData)) {
          const thisLevel = thisConstructionData.level;
          const thisContents = thisConstructionData.contents;
          if (isArray(thisContents) && Number.isFinite(thisLevel) && thisLevel > 0) {
            for (let i = 0; i < thisContents.length; i += 1) {
              const innerItem = thisContents[i];
              if (isObject(innerItem)) {
                // Two cases:
                // 1. {label, maps} to iterate to another SCA, maps is optional
                // 2. {param, duration, value} for an SCM
                const innerLabel = innerItem.label;
                if (innerLabel) {
                  // 1. Treat item as data to construct an
                  // inner SCA iteratively from library
                  const innerConstructionData = library[innerLabel];
                  if (isObject(innerConstructionData)) {
                    const innerLevel = innerConstructionData.level;
                    if (Number.isFinite(innerLevel) && innerLevel < thisLevel) {
                      // SCA constructor can iterate to another SCA from library
                      // with a strictly lower level (to prevent infinite loops)
                      let innerSca = new this.constructor({ library, label: innerLabel });
                      // maps are optional, if not supplied then same SCA is returned
                      innerSca = innerSca.map(innerItem.maps);
                      this.array.push(innerSca.array);
                    }
                  }
                } else if (innerItem.param) {
                  // 2. Treat entry as data for SCM constructor
                  this.array.push(new SynthControlMessage(innerItem));
                }
              }
            } // end of for loop
          }
        }
      }
    }
    // If any SCA arrays have been added,
    // the next step will flatten them to individual SCM items
    this.array = this.array.flat();
    // Freeze this instance so neither sca.array not sca can be changed
    Object.freeze(this.array);
    Object.freeze(this);
  }

  get length() { return this.array.length; }

  // get duration() { return 0 } // NOT YET IMPLEMENTED. LOOK AT SCM ARRAY.

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
        case 'duration':
        case 'rename':
        case 'flip':
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

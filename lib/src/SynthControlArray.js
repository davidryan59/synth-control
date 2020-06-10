import isString from 'is-string';
import isArray from 'isarray';
import isObject from 'is-object';

import SynthControlMessage from './SynthControlMessage';

const toStringMaxItems = 5;

const paramOK = param => isString(param) && 0 < param.length

// Print set
const ps = set => {
  let text = ''
  for (let elem of set) {
    text += `, ${elem.toString()}`
  }
  return text.slice(2)
}

const setUnion = (setA, setB) => {
  let union = new Set(setA)
  for (let elem of setB) {
    union.add(elem)
  }
  return union
}

const setIntersection = (setA, setB) => {
  let intersection = new Set()
  for (let elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem)
    }
  }
  return intersection
}

let id = 1;
class SynthControlArray {
  constructor(data) {
    this.id = id;
    id += 1;
    this.lv = 1 // level, positive integer
    this.ar = [] // contents array: either all SCMs, or all SCAs
    this.ps = new Set() // params set; set of parameter strings
    this.bt = 1 // beats, positive decimal
    this.tr = true // truncate boolean. Truncate (true) or Squash (false)
    this.pl = false // parallel boolean. Parallel (true) or Series (false)
    this.isn = false // is nested boolean (true if contains SCAs, false if contains SCMs)
    this.cch = {}; // cached data, only this part of SCA editable
    if (isArray(data)) {
      console.log('Array construction method being used')
      // Treat data array as set of items to concatenate
      const len = data.length;
      this.ar = new Array(len);
      for (let i = 0; i < len; i += 1) {
        const item = data[i];
        if (item instanceof SynthControlMessage) {
          this.ar[i] = item;
        // } else if (item instanceof SynthControlArray) {
        //   this.ar[i] = item.array;
        } else {
          this.ar[i] = new SynthControlMessage(item);
        }
      }
    } else if (isObject(data)) {
      // Treat data object as a library lookup
      // Will construct item data.type from data.library
      let isTruncate = true
      let isParallel = true
      let isNested = true
      const library = data.library;
      const type = data.type
      const beats = data.beats
      const truncate = data.truncate
      let tag = data.tag || '1'
      if (isObject(library)) {
        const thisConstructionData = library[type];
        if (isObject(thisConstructionData)) {
          const thisLevel = thisConstructionData.level;
          const thisContents = thisConstructionData.contents;
          const thisParam = thisConstructionData.param;
          if (isArray(thisContents) && Number.isFinite(thisLevel) && thisLevel > 0) {
            // SCA control
            let haveAddedSca = false
            let scaCount = 0
            let scaParamSet = new Set()
            let scaIsParallel = null
            // SCM control
            let haveAddedScm = false
            let scmParam = null
            // Iterate over contents
            console.log(`${tag}:  building SCA: ${type} at level ${thisLevel}`)
            for (let i = 0; i < thisContents.length; i += 1) {
              const innerTag = `${tag}.${i+1}`
              const innerItem = thisContents[i];
              if (isObject(innerItem)) {
                // Two cases:
                // 1. { type, ... } to iterate to another SCA in the library
                // 2. { param, ...} for final stage iteration to SCM
                if (!haveAddedScm && innerItem.type) {
                  // Case 1: innerItem is SCA from library
                  const innerType = innerItem.type;
                  const innerConstructionData = library[innerType];
                  if (isObject(innerConstructionData)) {
                    const innerLevel = innerConstructionData.level;
                    if (Number.isFinite(innerLevel) && 0 < innerLevel && innerLevel < thisLevel) {
                      // SCA constructor can iterate to another SCA from library
                      // with a strictly lower level (to prevent infinite loops)
                      let innerSca = new this.constructor({ library, type: innerType, tag: innerTag });
                      let innerParamSet = innerSca.paramSet
                      let innerParamSize = innerParamSet.size
                      if (scaCount === 0) {
                        // Could be in either series or parallel mode
                        // at this point, so just add the SCA
                        this.ar.push(innerSca)
                        haveAddedSca = true
                        scaCount += 1
                        scaParamSet = setUnion(scaParamSet, innerSca.paramSet)
                        console.log(`${innerTag}:  added initial SCA with params: ${ps(scaParamSet)}`)
                      } else {
                        const theIntersectionSize = setIntersection(scaParamSet, innerParamSet).size
                        if (scaIsParallel == null) {
                          if (theIntersectionSize === innerParamSet.size) {
                            // Parameter sets are identical
                            scaIsParallel = false
                            scaParamSet = new Set(innerParamSet)
                          } else if (theIntersectionSize === 0) {
                            // Parameter sets are disjoint
                            scaIsParallel = true
                          } else {
                            console.log(`${innerTag}:  ***** ERROR ***** parameter sets partially overlap: ${ps(innerParamSet)} | ${ps(scaParamSet)}`)
                            continue
                          }
                        }
                        if (scaIsParallel === true) {
                          if (theIntersectionSize === 0) {
                            this.ar.push(innerSca)
                            scaCount += 1
                            scaParamSet = setUnion(scaParamSet, innerParamSet)
                            console.log(`${innerTag}:  added SCA in parallel mode, params updated to: ${ps(scaParamSet)}`)
                          } else {
                            console.log(`${innerTag}:  ***** ERROR ***** in parallel mode, but new parameters overlap`)
                          }
                        } else if (scaIsParallel === false) {
                          if (theIntersectionSize === innerParamSet.size) {
                            this.ar.push(innerSca)
                            scaCount += 1
                            console.log(`${innerTag}:  added SCA in series mode`)
                          } else {
                            console.log(`${innerTag}:  ***** ERROR ***** in series mode, but new parameters are not identical`)
                          }
                        } else {
                          console.log(`${innerTag}:  ***** ERROR ***** should not be able to get here!`)
                        }
                      }
                    } else {
                      console.log(`${innerTag}:  ***** ERROR ***** SCA inner construction data does not have low enough level`)
                    }
                  } else {
                    console.log(`${innerTag}:  ***** ERROR ***** SCA inner construction data is not an object`)
                  }
                } else if (!haveAddedSca && (paramOK(thisParam) || paramOK(innerItem.param))) {
                  // Case 2: innerItem is SCM construction data
                  const innerData = Object.assign({}, {param: thisParam}, innerItem)
                  const newScm = new SynthControlMessage(innerData)
                  const newParam = newScm.param
                  if (!!newParam && (scmParam == null || scmParam === newParam)) {
                    this.ar.push(newScm);
                    scmParam = newParam
                    haveAddedScm = true
                    console.log(`${innerTag}:  added SCM: ${newScm}`)
                  } else {
                    console.log(`${innerTag}:  ***** ERROR ***** could not add scm due to wrong param: ${newScm}`)
                  }
                } else {
                  console.log(`${innerTag}:  ***** ERROR ***** innerItem object has been rejected`)
                }
              } else {
                console.log(`${innerTag}:  ***** ERROR ***** innerItem is not an object`)
              }
            }
            // Loop over contents has completed.
            // Amend any parameters necessary, depending on setup
            this.lv = thisLevel
            this.bt = (Number.isFinite(beats) && 0 < beats) ? beats : 1
            if (haveAddedSca) {
              this.ps = scaParamSet
              this.pl = (scaIsParallel === true) ? true : false
              this.isn = true
            } else if (haveAddedScm) {
              this.ps = new Set([scmParam])
              this.tr = (truncate === false) ? false : true
            } else {
              // No valid contents were added, keep default settings
            }
          } else {
            console.log(`${tag}:  ***** ERROR ***** library[type] does not have one of: contents array, positive level`)
          }
        } else {
          console.log(`${tag}:  ***** ERROR ***** library[type] is not an object`)
        }
      } else {
        console.log(`${tag}:  ***** ERROR ***** library is not an object`)
      }
    }
    // Finally, freeze this instance so nothing except the cache can be updated
    Object.freeze(this.ar);
    Object.freeze(this.ps);
    Object.freeze(this);
  }

  get level() { return this.lv; }
  get array() { return this.ar; }

  get paramSet() { return this.ps }

  get beats() { return this.bt }

  get isTruncate() { return this.tr }
  get isParallel() { return this.pl }
  get isNested() { return this.isn }


  // get length() { return this.ar.length; }
  //
  // get isStructureCached() { return Number.isFinite(this.cch.dm); }
  //
  // get isTimeSet() { return Number.isFinite(this.cch.ts); }
  //
  // get timeStart() { return this.isTimeSet ? this.cch.ts : 0; }
  //
  // get timeEnd() { return this.isTimeSet ? this.cch.te : this.duration; }
  //
  // get duration() { this.checkStructureCached(); return this.cch.dm; }
  //
  // get params() { this.checkStructureCached(); return this.cch.pa; }
  //
  // get durationsByParam() { this.checkStructureCached(); return this.cch.ds; }
  //
  // get initialValuesByParam() { this.checkStructureCached(); return this.cch.iv; }
  //
  // get messagesByParam() { this.checkStructureCached(); return this.cch.mp; }
  //
  // get(idx) { return this.ar[idx]; } // Get array item - not a getter!
  //
  // checkStructureCached() {
  //   if (!this.isStructureCached) this.cacheStructure();
  //   return this;
  // }
  //
  // cacheStructure() {
  //   const mapParamToScmArray = {};
  //   const scms = this.array;
  //   for (let i = 0; i < scms.length; i += 1) {
  //     const scm = scms[i];
  //     const { param } = scm;
  //     if (!(param in mapParamToScmArray)) mapParamToScmArray[param] = [];
  //     mapParamToScmArray[param].push(scm);
  //   }
  //   const paramArray = Object.keys(mapParamToScmArray);
  //   let maxDuration = 0;
  //   const paramDurations = {};
  //   const paramInitialValues = {};
  //   for (let i = 0; i < paramArray.length; i += 1) {
  //     const param = paramArray[i];
  //     const scmArray = mapParamToScmArray[param];
  //     const initialValue = scmArray[0].value;
  //     const duration = scmArray.reduce((acc, scm) => acc + scm.duration, 0);
  //     paramDurations[param] = duration;
  //     paramInitialValues[param] = initialValue;
  //     maxDuration = Math.max(maxDuration, duration);
  //   }
  //   // Save to cache
  //   this.cch.dm = maxDuration;
  //   this.cch.pa = paramArray;
  //   this.cch.ds = paramDurations;
  //   this.cch.iv = paramInitialValues;
  //   this.cch.mp = mapParamToScmArray;
  //   return this;
  // }
  //
  // setTimeStart(tStart, tMult = 1) {
  //   if (Number.isFinite(tStart) && Number.isFinite(tMult) && tMult > 0) {
  //     this.checkStructureCached();
  //     const paramArray = this.cch.pa;
  //     for (let i = 0; i < paramArray.length; i += 1) {
  //       const param = paramArray[i];
  //       const scmArray = this.cch.mp[param];
  //       let runningTime = tStart;
  //       for (let j = 0; j < scmArray.length; j += 1) {
  //         const scm = scmArray[j];
  //         scm.setTimeStart(runningTime, tMult);
  //         runningTime = scm.timeEnd;
  //       }
  //     }
  //     this.cch.ts = tStart;
  //     this.cch.te = tStart + tMult * this.cch.dm;
  //   }
  //   return this;
  // }
  //
  // // Perform a general transformation of the SCMs inside this SCA, using supplied data
  // // data object format is {type: 'theType', ...otherData}
  // // or [...data objects] to apply a sequence of maps
  // map(data) {
  //   if (isArray(data)) {
  //     // Treat data as array of map objects
  //     if (data.length === 0) return this;
  //     if (data.length === 1) return this.map(data[0]);
  //     return this.map(data[0]).map(data.slice(1));
  //   }
  //   if (isObject(data)) {
  //     const ta = this.array;
  //     const Tc = this.constructor;
  //     const dp = data.params;
  //     switch (data.type) {
  //       case 'value':
  //       case 'duration':
  //       case 'rename':
  //       case 'flip':
  //         return new Tc(ta.map((scm) => scm.map(data)));
  //       case 'keep':
  //         return isArray(dp) ? new Tc(ta.filter((scm) => dp.includes(scm.param))) : this;
  //       case 'remove':
  //         return isArray(dp) ? new Tc(ta.filter((scm) => !(dp.includes(scm.param)))) : this;
  //       case 'reverse':
  //         return new Tc([...ta].reverse());
  //       default:
  //       // Not matched the map function, return same object
  //     }
  //   }
  //   return this;
  // }
  //
  // toString() {
  //   let scmArray;
  //   let lastScm = null;
  //   let txt = `SynthControlArray, length ${this.length}${this.length ? ':' : ''}`;
  //   if (this.length < toStringMaxItems) {
  //     scmArray = this.array;
  //   } else {
  //     scmArray = this.array.slice(0, toStringMaxItems - 1);
  //     lastScm = this.array[this.length - 1];
  //   }
  //   scmArray.forEach((scm) => { txt += `\n  ${scm}`; });
  //   if (lastScm) txt += `\n  ...\n  ${lastScm}`;
  //   return txt;
  // }
}

export default SynthControlArray;

import { Logger } from 'log-count';
import isString from 'is-string';
import isArray from 'isarray';
import isObject from 'is-object';

import SynthControlMessage from './SynthControlMessage';
import displayNumber from './displayNumber';
import { printSet, setUnion, setIntersection } from './setFunctions';

const toStringMaxItems = 5;
const defaultTag = '1';
const dn = displayNumber(9);
const ps = printSet;
const paramOK = (param) => isString(param) && param.length > 0;

let id = 1;
class SynthControlArray {
  constructor(data) {
    // Get parameters ready for data
    this.id = id;
    id += 1;
    this.tg = defaultTag; // location tag
    this.lv = 1; // level, positive integer
    this.tp = ''; // type, from library entry
    this.bt = 1; // beats, positive decimal
    this.tr = true; // truncate boolean. Truncate (true) or Squash (false)
    this.pl = false; // parallel boolean. Parallel (true) or Series (false)
    this.isn = false; // is nested boolean (true if contains SCAs, false if contains SCMs)
    this.logger = null;
    this.ps = new Set(); // params set; set of parameter strings
    this.ar = []; // contents array: either all SCMs, or all SCAs
    this.cch = {}; // cached data, only this part of SCA editable
    // Valid constructor data must be supplied as an object
    if (isObject(data)) {
      const { logger } = data;
      if (logger && isObject(logger) && logger.isLogger) {
        this.logger = logger;
      } else {
        this.logger = new Logger();
      }
      const { sca, map } = data;
      const {
        library, type, tag = defaultTag, beats,
      } = data;
      if (sca instanceof SynthControlArray) {
        // Construction case 1: copy from existing SCA, with optional maps
        // 1a: Copy settings from sca
        // this.id   // Don't amend this object's new id value
        this.tg = sca.tg;
        this.lv = sca.lv;
        this.tp = sca.tp;
        this.bt = sca.bt;
        this.tr = sca.tr;
        this.pl = sca.pl;
        this.isn = sca.isn;
        this.logger = sca.logger;
        // this.ps = new Set(sca.paramSet) // Set this later
        this.ar = [...sca.array];
        this.cch = {}; // Reset cache
        // 1b: Map inner items according to any map supplied
        this.logger.debug(`Copying SCA ${this.id} from ${sca.id}, type ${sca.tp}`);
        if (isObject(map)) {
          this.logger.debug(`Mapping SCA ${this.id} according to data ${JSON.stringify(map)}`);
          // Relevant parameters to map are either i) those specified in the map or ii) all params
          const relevantParams = new Set([...(map.params || sca.ps)].filter((elt) => isString(elt) && elt.length > 0));
          this.logger.trace(`The relevant params are ${ps(relevantParams)}`);
          this.ar = this.ar.map((scx, idx) => {
            const innerParams = new Set([...(scx.paramSet || []), scx.param].filter((elt) => isString(elt) && elt.length > 0));
            this.logger.trace(`${idx}: The inner params are ${ps(innerParams)}`);
            const intersect = setIntersection(relevantParams, innerParams);
            if (intersect.size > 0) {
              const newScx = scx.map(map);
              this.logger.trace(`${idx}: Does mapping, got new object, id ${newScx.id}, beats ${newScx.beats}, oldbeats ${scx.beats}`);
              return newScx;
            }
            this.logger.trace(`${idx}: Returns original object, id ${scx.id}, beats ${scx.beats}`);
            return scx;
          });
        }
        this.ps = new Set(this.ar.map((scx) => {
          if (scx.param) return scx.param;
          if (scx.paramSet) return [...scx.paramSet];
          // don't return a param
        }).flat().filter((elt) => isString(elt) && elt.length > 0));
      } else if (isObject(library)) {
        // Construction case 2: from library
        this.tp = type;
        this.tg = tag;
        // Treat data object as a library lookup
        // Will construct item data.type from data.library
        const thisConstructionData = library[type];
        if (isObject(thisConstructionData)) {
          const thisLevel = thisConstructionData.level;
          const thisContents = thisConstructionData.contents;
          const thisParam = thisConstructionData.param;
          const truncate = !thisConstructionData.squash;
          if (isArray(thisContents) && Number.isFinite(thisLevel) && thisLevel > 0) {
            // SCA control
            let haveAddedSca = false;
            let scaCount = 0;
            let scaParamSet = new Set();
            let scaIsParallel = null;
            // SCM control
            let haveAddedScm = false;
            let haveAddedBeatsScm = false;
            let lastScmEndValue = null;
            let scmParam = null;
            // Iterate over contents
            this.logger.debug(`${tag}:  building SCA: ${type} at level ${thisLevel}`);
            for (let i = 0; i < thisContents.length; i += 1) {
              const innerTag = `${tag}.${i + 1}`;
              const innerItem = thisContents[i];
              if (isObject(innerItem)) {
                // Two cases:
                // 1. { type, ... } to iterate to another SCA in the library
                // 2. { param, ...} for final stage iteration to SCM
                if (!haveAddedScm && innerItem.type) {
                  // Case 1: innerItem is SCA from library
                  const innerType = innerItem.type;
                  const innerBeats = innerItem.beats;
                  const innerMaps = innerItem.maps;
                  const innerConstructionData = library[innerType];
                  if (isObject(innerConstructionData)) {
                    const innerLevel = innerConstructionData.level;
                    if (Number.isFinite(innerLevel) && innerLevel > 0 && innerLevel < thisLevel) {
                      // SCA constructor can iterate to another SCA from library
                      // with a strictly lower level (to prevent infinite loops)
                      let innerSca = new this.constructor({
                        library, type: innerType, tag: innerTag, beats: innerBeats, logger: this.logger,
                      });
                      innerSca = innerSca.map(innerMaps);
                      const innerParamSet = innerSca.paramSet;
                      if (scaCount === 0) {
                        // Could be in either series or parallel mode
                        // at this point, so just add the SCA
                        this.ar.push(innerSca);
                        haveAddedSca = true;
                        scaCount += 1;
                        scaParamSet = setUnion(scaParamSet, innerSca.paramSet);
                        this.logger.debug(`${innerTag}:  added initial SCA with params: ${ps(scaParamSet)}`);
                      } else {
                        const theIntersectionSize = setIntersection(scaParamSet, innerParamSet).size;
                        if (scaIsParallel == null) {
                          if (theIntersectionSize === innerParamSet.size) {
                            // Parameter sets are identical
                            scaIsParallel = false;
                            scaParamSet = new Set(innerParamSet);
                          } else if (theIntersectionSize === 0) {
                            // Parameter sets are disjoint
                            scaIsParallel = true;
                          } else {
                            this.logger.warn(`${innerTag}:  parameter sets partially overlap: ${ps(innerParamSet)} | ${ps(scaParamSet)}`);
                            continue;
                          }
                        }
                        if (scaIsParallel === true) {
                          if (theIntersectionSize === 0) {
                            this.ar.push(innerSca);
                            scaCount += 1;
                            scaParamSet = setUnion(scaParamSet, innerParamSet);
                            this.logger.debug(`${innerTag}:  added SCA in parallel mode, params updated to: ${ps(scaParamSet)}`);
                          } else {
                            this.logger.warn(`${innerTag}:  in parallel mode, but new parameters overlap`);
                          }
                        } else {
                          // scaIsParallel === false
                          if (theIntersectionSize === innerParamSet.size) {
                            this.ar.push(innerSca);
                            scaCount += 1;
                            this.logger.debug(`${innerTag}:  added SCA in series mode`);
                          } else {
                            this.logger.warn(`${innerTag}:  in series mode, but new parameters are not identical`);
                          }
                        }
                      }
                    } else {
                      this.logger.warn(`${innerTag}:  library[${innerType}] does not have low enough level`);
                    }
                  } else {
                    this.logger.warn(`${innerTag}:  library[${innerType}] is not an object`);
                  }
                } else if (!haveAddedSca && (paramOK(thisParam) || paramOK(innerItem.param))) {
                  // Case 2: innerItem is SCM construction data
                  const innerData = {
                    param: thisParam, ...innerItem, tag: innerTag, logger: this.logger,
                  };
                  const newScm = new SynthControlMessage(innerData);
                  const newParam = newScm.param;
                  if (!!newParam && (scmParam == null || scmParam === newParam)) {
                    this.ar.push(newScm);
                    scmParam = newParam;
                    haveAddedScm = true;
                    lastScmEndValue = newScm.valueEnd;
                    if (!newScm.isExactTime) haveAddedBeatsScm = true;
                    this.logger.trace(`${innerTag}:  added SCM: ${newScm}`);
                  } else {
                    this.logger.warn(`${innerTag}:  could not add SCM due to wrong param: ${newScm}`);
                  }
                } else {
                  this.logger.warn(`${innerTag}:  innerItem object has been rejected`);
                }
              } else {
                this.logger.warn(`${innerTag}:  innerItem is not an object`);
              }
            } // end for
            // Loop over contents has completed.
            // Amend any parameters necessary, depending on setup
            this.lv = thisLevel;
            this.bt = (Number.isFinite(beats) && beats > 0) ? beats : 1;
            if (haveAddedSca) {
              this.ps = scaParamSet;
              this.pl = (scaIsParallel === true);
              this.isn = true;
            } else if (haveAddedScm) {
              this.ps = new Set([scmParam]);
              this.tr = truncate !== false;
              // Must have at least one beats SCM, if this is an SCA that contains SCMs
              if (!haveAddedBeatsScm) {
                const extraTag = `${tag}.${thisContents.length + 1}`;
                const extraScm = new SynthControlMessage({
                  param: scmParam,
                  beats: 1,
                  value: lastScmEndValue,
                  tag: extraTag,
                  logger: this.logger,
                });
                this.ar.push(extraScm);
                this.logger.trace(`${extraTag}:  automatically added beats SCM: ${extraScm}`);
              }
            } else {
              // No valid contents were added, keep default settings
            }
          } else {
            this.logger.warn(`${tag}:  library[type] does not have one of: contents array, positive level`);
          }
        } else {
          this.logger.warn(`${tag}:  library[type] is not an object`);
        }
      } else {
        this.logger.warn(`${tag}:  library is not an object`);
      }
    }
    // Logger is mandatory, make sure it is present
    if (!this.logger) this.logger = new Logger();
    // Finally, freeze this instance so nothing except the cache can be updated
    Object.freeze(this.ar);
    Object.freeze(this.ps);
    Object.freeze(this);
    this.logger.trace({ text: 'New SCA created:', type: 'SCA constructor' });
    this.logger.debug({ obj: this });
  }

  get tag() { return this.tg; }

  get level() { return this.lv; }

  get type() { return this.tp; }

  get isTruncate() { return !!this.tr; }

  get isParallel() { return !!this.pl; }

  get isNested() { return !!this.isn; }

  get paramSet() { return this.ps; }

  get array() { return this.ar; }

  get milliseconds() { return 0; }

  get beats() { return this.bt; }

  get contentsTotalMs() {
    if (this.isNested) return 0;
    if (!Number.isFinite(this.cch.tms)) this.cch.tms = this.array.reduce((acc, scm) => acc + scm.milliseconds, 0);
    return this.cch.tms;
  }

  get contentsTotalBeats() {
    if (this.isParallel) return this.beats;
    if (!Number.isFinite(this.cch.tbt)) this.cch.tbt = this.array.reduce((acc, scx) => acc + scx.beats, 0);
    return this.cch.tbt;
  }

  setBPM(inputBpm) {
    if (!(Number.isFinite(inputBpm) && inputBpm > 0)) return;
    if (this.cch.bpm != null && this.cch.bpm !== inputBpm) {
      // Wipe other caches
      this.cch.bt = null;
      this.logger.debug(`${this.tag}:  ${this.type} wiped previous beat cache`);
    }
    this.cch.bpm = inputBpm;
    this.logger.trace(`${this.tag}:  ${this.type} stored bpm: ${inputBpm}`);
  }

  scaleToBeats(inputBeats) {
    if (!(Number.isFinite(this.cch.bpm) && Number.isFinite(inputBeats) && inputBeats > 0)) return;
    this.cch.bt = inputBeats;
    // Four cases are allowed:
    // 1: SCA contains SCAs in parallel. Inner SCAs get same beats as this SCA.
    // 2: SCA contains SCAs in series. Inner SCAs get scaled beats as this SCA.
    // 3: SCA contains SCMs in series, truncate = true
    // 4: SCA contains SCMs in series, truncate = false
    const beatsPerMin = this.cch.bpm;
    const beatsPerMs = beatsPerMin / 60000;
    const msPerBeat = 60000 / beatsPerMin;
    const totalContentsBeats = this.contentsTotalBeats;
    const inputMs = inputBeats * msPerBeat;
    const text = `${this.tag}:  scale '${this.type}' to ${dn(inputBeats)} beats [${dn(inputMs)} ms at ${dn(beatsPerMin)} bpm]`;
    if (totalContentsBeats <= 0) this.logger.error('Division by zero'); // shouldn't be able to reach this line, since beats SCM always added
    if (this.isParallel) {
      // 1: SCA contains SCAs in parallel. Inner SCAs get same beats as this SCA.
      this.logger.debug(`${text}, inner SCA parallel`);
      this.array.forEach((sca) => {
        sca.setBPM(beatsPerMin);
        sca.scaleToBeats(inputBeats); // Ignore beats on inner values
      });
    } else if (this.isNested) {
      // 2: SCA contains SCAs in series. Inner SCAs get scaled beats as this SCA.
      this.logger.debug(`${text}, inner SCA series`);
      const beatMultiplier = inputBeats / totalContentsBeats;
      this.array.forEach((sca) => {
        sca.setBPM(beatsPerMin);
        sca.scaleToBeats(beatMultiplier * sca.beats);
      });
    } else {
      // Cases 3 and 4, SCA contains SCMs
      const totalMs = this.contentsTotalMs;
      const totalMsInBeats = totalMs * beatsPerMs;
      if (totalMsInBeats <= inputBeats) {
        // Can expand or contract contents beats to make total match SCA beats
        this.logger.debug(`${text}, inner SCM beats`);
        const spareBeats = inputBeats - totalMsInBeats;
        const beatMultiplier = spareBeats / totalContentsBeats;
        this.array.forEach((scm) => {
          if (scm.isExactTime) {
            scm.setActualMs();
          } else {
            scm.setActualMs((beatMultiplier * scm.beats) * msPerBeat);
          }
        });
      } else if (this.isTruncate) {
        // 3: SCA contains SCMs in series, truncate = true
        this.logger.debug(`${text}, inner SCM truncate`);
        let cumulMs = 0;
        for (let i = 0; i < this.array.length; i += 1) {
          const scm = this.array[i];
          // this.logger.warn(dn(scm.milliseconds), dn(cumulMs), dn(inputMs))
          if (!scm.isExactTime) {
            scm.setActualMs(0); // zero duration on non-timed (beats) SCM
          } else if (inputMs <= cumulMs) {
            scm.setActualMs(0); // zero duration for timed SCM after cutoff
          } else {
            const thisMs = scm.milliseconds;
            const endMs = cumulMs + thisMs;
            if (inputMs <= endMs) {
              // this.logger.warn(dn(thisMs), dn(cumulMs), dn(inputMs), dn(endMs))
              const fract = (inputMs - cumulMs) / thisMs;
              scm.setActualMs(fract * thisMs, fract); // Overlaps end, partially truncate
            } else {
              scm.setActualMs(); // Do not truncate
            }
            cumulMs = endMs;
          }
        }
      } else {
        // 4: SCA contains SCMs in series, truncate = false (squash mode)
        this.logger.debug(`${text}, inner SCM squash`);
        const reduceFraction = inputMs / totalMs; // between 0 and 1
        this.array.forEach((scm) => {
          if (scm.isExactTime) {
            scm.setActualMs(reduceFraction * scm.milliseconds); // ms gets squashed
          } else {
            scm.setActualMs(0); // beats gets squashed to zero duration
          }
        });
      }
    }
  }

  calculateTiming(inputStartTimeS) {
    // Returns an end time
    // These times Audio Context times, all in seconds
    if (!(Number.isFinite(this.cch.bt) && Number.isFinite(inputStartTimeS))) return 0;
    let cumulTimeS = inputStartTimeS;
    let endTimeS = null;
    for (let i = 0; i < this.array.length; i += 1) {
      const scx = this.array[i];
      endTimeS = scx.calculateTiming(cumulTimeS);
      if (!this.isParallel) cumulTimeS = endTimeS;
    }
    this.logger.debug(`${this.tag}:  ${this.type} (SCA) ${dn(inputStartTimeS)} s to ${dn(endTimeS)} s`);
    this.cch.ts = inputStartTimeS;
    this.cch.te = endTimeS;
    return endTimeS;
  }

  mapParamToMessages() {
    const scmsByParam = {};
    [...this.paramSet].forEach((param) => scmsByParam[param] = []);
    if (Number.isFinite(this.cch.ts)) {
      if (this.isNested) {
        this.array.forEach((sca) => {
          const innerResult = sca.mapParamToMessages();
          const params = Object.keys(innerResult);
          params.forEach((param) => {
            scmsByParam[param] = [...scmsByParam[param], ...innerResult[param]];
          });
        });
      } else {
        this.array.forEach((scm) => {
          if (scm.actualMs > 0) scmsByParam[scm.param].push(scm);
        });
      }
    } else {
      this.logger.error('mapParamToScmArray called before calculating timings');
    }
    return scmsByParam;
  }

  // Perform a general transformation of the SCMs inside this SCA, using supplied data
  // data object format is {type: 'theType', ...otherData}
  // or [...data objects] to apply a sequence of maps
  map(data) {
    if (isArray(data)) { // Treat data as array of map objects
      if (data.length === 0) return this;
      if (data.length === 1) return this.map(data[0]);
      return this.map(data[0]).map(data.slice(1));
    } if (isObject(data)) {
      switch (data.type) {
        case 'value':
        case 'prefixParam':
          return new this.constructor({
            sca: this,
            map: data,
          });
        default:
          return this;
      }
    }
    return this;
  }
}

export default SynthControlArray;

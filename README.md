## synth-control

[![npm version](https://badge.fury.io/js/synth-control.svg)](https://badge.fury.io/js/synth-control)
[![Downloads per month](https://img.shields.io/npm/dy/synth-control.svg?maxAge=31536000)](https://github.com/davidryan59/synth-control)
[![Build status](https://travis-ci.org/davidryan59/synth-control.svg?master)](https://travis-ci.org/davidryan59)

### Classes

**SynthControlMessage** (SCM) - controls a single synth parameter, during a short interval.
- For a constant function, specify param, length, value
- For a linear ramp function, specify param, length, value, valueEnd

**SynthControlArray** (SCA) - holds an array of SCM, in the order they will be played.

### Example constructors
``` js
// Constant value 440, on param freq, with length 4
const scm1 = new SynthControlMessage({param: 'freq', length: 4, value: 440})

// Ramp value from 0.5 to 0.1, on param gain, with length 2
const scm2 = new SynthControlMessage({p: 'gain', l: 2, start: 0.5, end: 0.1})

// Copy settings from scm1, but with value ramping linearly from 550 to 660
const scm3 = new SynthControlMessage(scm1, {value: 550, valueEnd: 660})
```

### Data in constructor object

| Key | Default | Type | Can use any of these to initialise, or as getter |
| - | - | - | - |
| p | "" | String | p, param |
| l | 0 | Number, non-negative | l, len, length |
| v | 0 | Number | v, val, value, start, vS, valStart, valueStart |
| vE | undefined | Number | vE, end, valEnd, valueEnd |

### Mappings

Can make new SCMs from mappings on existing SCMs, via `scm.map(data)`:
- `data` is of form `dataObject` to apply one map, or `[...dataObjects]` to apply multiple maps in sequence
- `dataObject` is of form `{type: 'map type', ...otherData}`
- Some defined map types are: `rename`, `length`, `value`. Here are some examples:
- `{type: 'rename', old: 'oldParam', new: 'newParam'}` - if scm has param oldParam, make new scm with param newParam
- `{type: 'length', op: '+', num: 5}` - make new scm with length + 5 compared to old scm
- `{type: 'length', op: '+', num: 5, params: ['param1', 'param2']}` - same, but only if param is in the array
- `{type: 'value', op: '*', num: -0.5}` - make new scm with value * -0.5 compared to old scm
- `{type: 'value', op: '*', num: -0.5, params: ['param3']}` - same, but only if param is param3

``` js
const scm1 = new SynthControlMessage({param: 'freq', length: 4, value: 440})
const scm2 = scm1.map({type: 'len', op: '+', num: 2})
console.log(scm2.length) // 4 + 2 = 6
console.log(scm2.value) // unchanged, 440
```

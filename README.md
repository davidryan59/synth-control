## synth-control

[![npm version](https://badge.fury.io/js/synth-control.svg)](https://badge.fury.io/js/synth-control)
[![Downloads per month](https://img.shields.io/npm/dy/synth-control.svg?maxAge=31536000)](https://github.com/davidryan59/synth-control)
[![Build status](https://travis-ci.org/davidryan59/synth-control.svg?master)](https://travis-ci.org/davidryan59)

### Classes

**SynthControlMessage** (**SCM**) - controls a single synth parameter, during a short interval.
- For a constant function, specify param, length, value
- For a linear ramp function, specify param, length, value, valueEnd

**SynthControlArray** (**SCA**) - holds an array of SCM, in the order they will be played, for one or more synth parameters.

### Quick start

Do `npm install synth-control` in your Javascript npm project directory. Then in a Javascript file:

``` js
import { SynthControlArray, SynthControlMessage } from 'synth-control'

// Control parameter 'freq', for length 3, with value 320
const scm1 = new SynthControlMessage({ param: 'freq', length: 3, value: 320 })

// Control parameter (p) 'gain', for length (l) 2, with value ramping linearly from start 0.5 to end 0.1
const scm2 = new SynthControlMessage({ p: 'gain', l: 2, start: 0.5, end: 0.1 })

// Copy scm1 above, but with value ramping linearly from 550 to 660
const scm3 = new SynthControlMessage(scm1, { value: 550, valueEnd: 660 })

// Make control array for parameters 'freq' and 'gain', total length 4 on each parameter
const sca1 = new SynthControlArray([
  { param: 'freq', length: 1, value: 256 },
  scm1,
  { param: 'gain', length: 4, start: 0.01, end: 0.8 }
])

// Make control array to play sca1 twice, the second time a perfect fifth higher (x1.5)
const sca2 = new SynthControlArray([
  sca1,
  sca1.map({ type: 'value', op: '*', num: 3 / 2, params: ['freq'] })
])

// Make control array from a library. Each key in the library is a label, specifying an SCA.
// Label 'doRayMe' plays 3 notes in sequence (freq), with a ramp up and down in gain.
// Label 'repeatReverse' plays doRayMe twice, the second time reversed and a minor third higher.
//   It also adds a third parameter, timbre.
// Each label must specify 'level', a non-negative number, and if an SCA contains
//   another SCA via {label: 'innerSCA'} then innerSCA must have strictly lower level,
//   this is to prevent infinite loops.
const myLibrary = {
  doRayMe: {
    level: 1,
    contents: [
      { param: 'freq', length: 8, value: 240 },
      { param: 'freq', length: 4, value: 270 },
      { param: 'freq', length: 12, value: 300 },
      { param: 'gain', length: 4, start: 0, end: 0.8 },
      { param: 'gain', length: 20, start: 0.8, end: 0 }
    ]
  },
  repeatReverse: {
    level: 2,
    contents: [
      { param: 'timbre', length: 48, start: 50, end: 75 },
      { label: 'doRayMe' },
      { label: 'doRayMe',
        maps: [
          { type: 'reverse' },
          { type: 'value', op: '*', num: 6 / 5, params: ['freq'] },
          { type: 'value', op: '+', num: 0.1, params: ['gain'] }
        ]
      }
    ]
  }
}
const sca3 = new SynthControlArray({ library: myLibrary, label: 'repeatReverse' })
```

### Data in `new SynthControlMessage(data)`

| Key | Default | Type | Can use any of these in data object to initialise, or as getter |
| - | - | - | - |
| p | "" | String | p, param |
| l | 0 | Number, non-negative | l, len, length |
| v | 0 | Number | v, val, value, start, vS, valStart, valueStart |
| vE | undefined | Number | vE, end, valEnd, valueEnd |

An alternative constructor is `new SynthControlMessage(otherScm, data)` which first copies settings from `otherScm` and then overwrites any specified settings in `data`.

### Data in `new SynthControlArray(data)`

1. **Array construction**: If `data` is an array, then each array item can be any of:
  - SCM
  - Data object to construct an SCM
  - SCA (which gets flattened)

The SCA constructor can be used to concatenate smaller SCAs. It is possible to first map SCAs (using `sca.map(data)`, see next section) and then combine them using the constructor, such as `sca2 = new SynthControlArray([ sca1, sca1.map(data) ])`. In this way, very complex synth control (SCA) can be built up iteratively from atomic units of synth control messages (SCM).

2. **Library construction** If `data` is an object, constructor will look for a library and a label, e.g. `{library: myLibrary, label: 'myLabel'}`
  - `myLibrary` will be a Javascript plain object
  - `myLabel` will be a string
  - `constructionData` is `myLibrary[myLabel]` and will be an object with keys `level` and `contents`
  - `level` will be a non-negative integer
  - `contents` will be an array
  - For each entry `contentItem` there are two formats:
    - SCM construction data, such as `{param: 'freq', length: 10, value: 420}`
    - Link to SCA library construction, such as `{label: 'otherLabel'}`, this will **iterate** SCA construction
  - See the example at the top of this page for a complete library and SCA constructor
  - For iterated items, `level` must be strictly lower, which prevents any infinite loops.

### Mappings

Can make new SCMs / SCAs from mappings on existing SCMs / SCAs, via `scm.map(data)` and `sca.map(data)`:
- If `data` is an array, then each mapping in the data array will be applied sequentially, with the final result returned.
- Otherwise, assume `data` is a plain Javascript object
- General form is `data = {type: 'type', ...otherData}`, and the mapping used will switch based on `type`.
- If type is not recognised, do nothing, and return the original object.
- Here are some defined types of mapping:
- `{type: 'rename', old: 'paramOld', new: 'paramNew'}`
  - Any SCM with parameter `paramOld` will be replaced by a new SCM, a copy of the old, but with different parameter `paramNew`.
- `{type: 'length', op: '+', num: 5}`
  - Every SCM will have 5 added to the length.
- `{type: 'length', op: '*', num: 3, params: ['param1', 'param2']}`
  - Any SCM with parameter `param1` or `param2` will have its length multiplied by 3. Other SCMs with non-matching parameter will be unchanged.
- `{type: 'value', op: '^', num: 3}`
  - Every SCM will have its value cubed (and if end value is specified, its end value will also be cubed).
- `{type: 'value', op: 'log', num: 7, params: ['param1']}`
  - Any SCM with parameter `param1` will have value -> log_7(value), and same for end value if specified. Other SCMs with non-matching parameter will be unchanged.
- `{type: 'reverse'}`
  - For SCA, reverses array order of SCMs, which is a partial time reversal (since value/valueEnd are not flipped around).
- `{type: 'flip'}`
  - Every SCM which has valueEnd specified will have value / valueEnd flipped.
- `{type: 'flip', params: ['param1', 'param2']}`
  - Any SCM with parameter `param1` or `param2` which has valueEnd specified will have value / valueEnd flipped.
- `{type: 'keep', param: ['param1', 'param2']}`
  - For SCA, filters the array to keep only SCMs with parameter `param1` or `param2`. (Does nothing on SCM.)
- `{type: 'remove', param: ['param1', 'param2', 'param3']}`
  - For SCA, filters the array to remove any SCM with parameter `param1`, `param2`, or `param3`.

Note - for a full time reversal, need to combine `reverse` and `flip` on all parameters.

### Operations

For mappings of type `value` and `length`, specify an operation type `op` in the data object to perform a mathematical operation on the SCMs. For binary operations, must also specify `num`.

Unary operations:
- `{type: 'value', op: 'abs'}` maps value `a` to `abs(a)`, the absolute value, always a positive number

Binary operations:
- `{type: 'value', op: '+', num: b}` maps value `a` to `a + b`
- `{type: 'value', op: '*', num: b}` maps value `a` to `a * b`
- `{type: 'value', op: '^', num: b}` maps value `a` to `a ^ b`, which is `a ** b`
- `{type: 'value', op: '-', num: b}` maps value `a` to `b - a` (order-reversing, additive inversion in `b`)
- `{type: 'value', op: '/', num: b}` maps value `a` to `b / a` (order-reversing, multiplicative inversion in `b`)
- `{type: 'value', op: 'exp', num: b}` maps value `a` to `b ^ a`, which is `b ** a` (order-reversing)
- `{type: 'value', op: 'log', num: b}` maps value `a` to `log(a) base b`, which is `log_b(a)`
- `{type: 'value', op: 'max', num: b}` maps value `a` to `max(a, b)`
- `{type: 'value', op: 'min', num: b}` maps value `a` to `min(a, b)`

(These all map value but not length, so to map length replace `type: 'value'` by `type: 'length'`.)

### Reference

- An SCA is built up from SCMs similar to a piecewise linear function. See Wikipedia article: https://en.wikipedia.org/wiki/Piecewise_linear_function.

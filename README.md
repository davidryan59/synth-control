## synth-control

[![npm version](https://badge.fury.io/js/synth-control.svg)](https://badge.fury.io/js/synth-control)
[![Downloads per month](https://img.shields.io/npm/dy/synth-control.svg?maxAge=31536000)](https://github.com/davidryan59/synth-control)
[![Build status](https://travis-ci.org/davidryan59/synth-control.svg?master)](https://travis-ci.org/davidryan59)

### Classes

**SynthControlMessage** (SCM) - controls a single synth parameter, during a short interval.
- For a constant function, specify param, length, value
- For a linear ramp function, specify param, length, value, valueEnd

**SynthControlArray** (SCA) - holds an array of SCM, in the order they will be played, for one or more synth parameters.

### Quick examples
``` js
// Control parameter 'freq', for length 3, with value 320
const scm1 = new SynthControlMessage({param: 'freq', length: 3, value: 320})

// Control parameter 'gain', for length 2, with value ramping linearly from 0.5 to 0.1
const scm2 = new SynthControlMessage({p: 'gain', l: 2, start: 0.5, end: 0.1})

// Copy scm1 above, but with value ramping linearly from 550 to 660
const scm3 = new SynthControlMessage(scm1, {value: 550, valueEnd: 660})

// Make control array for parameters 'freq' and 'gain', for length 4
const sca1 = new SynthControlArray([
  {param: 'freq', length: 1, value: 256},
  scm1,
  {param: 'gain', length: 4, start: 0.01, end: 0.8}
])

// Make control array to play sca1 twice, the second time a perfect fifth higher (x1.5)
const sca2 = new SynthControlArray([
  sca1,
  sca1.map({type: 'value', op: '*', num: 3/2, params: ['freq']})
])
```

### Data in `new SynthControlMessage(data)`

| Key | Default | Type | Can use any of these to initialise, or as getter |
| - | - | - | - |
| p | "" | String | p, param |
| l | 0 | Number, non-negative | l, len, length |
| v | 0 | Number | v, val, value, start, vS, valStart, valueStart |
| vE | undefined | Number | vE, end, valEnd, valueEnd |

### Data in `new SynthControlArray(data)`

- `data` must be an array
- Each array item should be any of:
  - SCM
  - Data object to construct an SCM
  - SCA (which gets flattened)

The SCA constructor can be used to concatenate smaller SCAs. It is possible to first map SCAs (using `sca.map(data)`, see next section) and then combine them using the constructor, such as `sca2 = new SynthControlMessage([ sca1, sca1.map(data) ])`. In this way, very complex synth control (SCA) can be built up iteratively from atomic units of synth control messages (SCM).

### Mappings

Can make new SCMs / SCAs from mappings on existing SCMs / SCAs, via `scm.map(data)` and `sca.map(data)`:
- If `data` is an array, then each mapping in the data array will be applied sequentially, with the final result returned.
- Otherwise, assume `data` is a plain Javascript object
- General form is `data = {type: 'type', ...otherData}`, and the mapping used will switch based on `type`.
- If type is not recognised, do nothing, and return the original object.
- Here are some defined types of mapping:
- `{type: 'rename', old: 'paramOld', new: 'paramNew'}`
  - Any SCM with parameter `paramOld` will be replaced by a new SCM with parameter `paramNew` (and other values unchanged)
- `{type: 'length', op: '+', num: 5}`
  - Every SCM will have 5 added to the length
- `{type: 'length', op: '*', num: 3, params: ['param1', 'param2']}`
  - Any SCM with parameter `param1` or `param2` will have its length multiplied by 3 (and other SCMs are unchanged)
- `{type: 'value', op: '^', num: 3}`
  - Every SCM will have its value cubed (and if end value is specified, its end value will also be cubed)
- `{type: 'value', op: 'log', num: 7, params: ['param3']}`
  - Any SCM with parameter `param3` will have value -> log_7(value)
- `{type: 'reverse'}`
  - For SCA, reverses array order of SCMs, which gives similar effect to time reversal
- `{type: 'keep', param: ['param4', 'param5']}`
  - For SCA, filters the array to keep only SCMs with parameter `param4` or `param5`
- `{type: 'remove', param: ['param6', 'param7', 'param8']}`
  - For SCA, filters the array to remove any SCM with parameter `param6`, `param7`, or `param8`

### Operations

For mappings of type `length` and `value`, specify `op` and `num` in the data object to perform a numeric operation:
- `{op: '+', num: b}` - a -> a + b
- `{op: '*', num: b}` - a -> a * b
- `{op: '^', num: b}` - a -> a ^ b, which is a ** b
- `{op: 'exp', num: b}` - a -> b ^ a, which is b ** a
- `{op: 'log', num: b}` - a -> log(a) base b, which is log_b(a)

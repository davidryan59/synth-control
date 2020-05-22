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

// Copy settings from scm1, but now ramp value from 550 to 660
const scm3 = new SynthControlMessage(scm1, {value: 550, valueEnd: 660})
```

### Data in constructor object

| Key | Default | Type | Can use any of these to initialise, or as getter |
| - | - | - | - |
| p | "" | String | p, param |
| l | 0 | Number, non-negative | l, len, length |
| v | 0 | Number | v, val, value, start, vS, valStart, valueStart |
| vE | undefined | Number | vE, end, valEnd, valueEnd |

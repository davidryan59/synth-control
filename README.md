## synth-control

[![npm version](https://badge.fury.io/js/synth-control.svg)](https://badge.fury.io/js/synth-control)
[![Downloads per month](https://img.shields.io/npm/dy/synth-control.svg?maxAge=31536000)](https://github.com/davidryan59/synth-control)
[![Build status](https://travis-ci.org/davidryan59/synth-control.svg?master)](https://travis-ci.org/davidryan59)

**SynthControlMessage** (SCM) - controls a single synth parameter, during a short interval. Simplest cases are constant or linear functions. Specify at least `param`, `length` and `value`.

**SynthControlArray** (SCA) - holds an array of SCM, in the order they will be played.

**SynthControlLibrary** (SCL) - specifies how to construct larger SCA from smaller SCA (fractal).

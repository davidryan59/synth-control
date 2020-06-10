/* eslint-disable no-console */

import chalk from 'chalk';

import { SynthControlArray, SynthControlMessage } from '../src';

const type = 'multiple_ramp_decay'
const library = {
  // Case 1: SCA contains SCMs in series, squashing mode
  ramp_3ms_12ms: {
    level: 1,
    param: 'ramp',
    truncate: false,
    contents: [
      {ms: 3, vS: 0, vE: 1},
      {beats: 1, v: 1},
      {ms: 5, vS: 1, vE: 0.5},
      {ms: 7, vS: 0.5, vE: 0},
      {param: 'ramp2', ms: 8, vS: 1, vE: 0},
    ]
  },

  // Case 2: SCA contains SCMs in series, truncating mode (default)
  decay_10ms_1000ms: {
    level: 1,
    param: 'decay',
    contents: [
      {ms: 10, v: 0},
      {ms: 1000, vs: 0, ve: -100},
      {beats: 1, v: -100},
    ]
  },

  // Case 3: SCA contains SCAs in parallel (all have mutually disjoint parameters)
  ramp_decay: {
    level: 2,
    beats: 5,
    contents: [
      {type: 'ramp_3ms_12ms', beats: 5},
      {type: 'decay_10ms_1000ms', beats: 5},
    ]
  },

  // Case 4: SCA contains SCAs in series (all have identical parameters)
  multiple_ramp_decay: {
    level: 3,
    contents: [
      {type: 'ramp_decay', beats: 2},
      {type: 'ramp_decay', beats: 3},
    ]
  },
}

console.log('')
console.log('')
console.log('')
console.log('')
console.log('')
console.log('')
console.log('')
console.log('')
const newSca = new SynthControlArray({library, type})
console.log(newSca)
console.log('')
console.log(newSca.ar[0])
console.log('')
console.log(newSca.ar[0].ar[0])
console.log('')
console.log(newSca.ar[0].ar[0].ar[0])
console.log('')
console.log('')

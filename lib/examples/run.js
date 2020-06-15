/* eslint-disable no-console */

import { Logger } from 'log-count';

import { SynthControlArray } from '../src';

const type = 'multiple_ramp_decay';
const library = {
  // Case 1: SCA contains SCMs in series, squashing mode
  ramp_3ms_12ms: {
    level: 1,
    param: 'ramp',
    squash: true, // Two modes for SCM: truncate (default) and squash
    contents: [
      { ms: 3, vS: 0, vE: 1 },
      { beats: 1.01, v: 1 },
      { ms: 5, vS: 1, vE: 0.5 },
      { ms: 700, vS: 0.5, vE: 0 },
    ],
  },

  // Case 2: SCA contains SCMs in series, truncating mode (default)
  decay_10ms_1000ms: {
    level: 1,
    param: 'decay',
    contents: [
      { ms: 10, v: 0 },
      { ms: 1000, vs: 0, ve: -100 },
      { ms: 10000, vs: -100, ve: -123.45 },
    ], // A beats SCM will be added on the end automatically
  },

  // Case 3: SCA contains SCAs in parallel (all have mutually disjoint parameters)
  ramp_decay: {
    level: 2,
    beats: 6.07,
    contents: [
      { type: 'ramp_3ms_12ms', beats: 4.53 },
      { type: 'decay_10ms_1000ms', beats: 2.57 },
    ],
  },

  // Case 4: SCA contains SCAs in series (all have identical parameters)
  multiple_ramp_decay: {
    level: 3,
    contents: [
      { type: 'ramp_decay', beats: 2.23 },
      { type: 'ramp_decay', beats: 3.059 },
    ],
  },
};

const logger = new Logger();
const sca = new SynthControlArray({
  library,
  type,
  logger,
  beats: 3.5,
});
sca.setBPM(109);
sca.scaleToBeats(3);
sca.calculateTiming(0);
const messages = sca.mapParamToMessages();
logger.success({ obj: sca });
logger.success({ obj: messages });

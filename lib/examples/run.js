/* eslint-disable no-console */

import { SynthControlMessage } from '../src';

console.log('');
console.log('***** Running SynthControlMessage examples *****');
console.log('');
console.log('new SynthControlMessage():');
console.log(`${new SynthControlMessage()}`);
console.log('');
console.log("new SynthControlMessage({p:'freq', l:4, v:440}):");
console.log(`${new SynthControlMessage({ p: 'freq', l: 4, v: 440 })}`);
console.log('');
console.log("new SynthControlMessage({param:'gain', length:0.05, v:-0.352}):");
console.log(`${new SynthControlMessage({ param: 'gain', length: 0.05, v: -0.352 })}`);
console.log('');
console.log('');

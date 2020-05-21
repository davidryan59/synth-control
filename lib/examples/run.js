/* eslint-disable no-console */

import chalk from 'chalk';

import { SynthControlArray, SynthControlMessage } from '../src';

console.clear();
console.log('');
console.log(chalk.magenta(`*************** Running ${chalk.bold('synth-control')} examples ***************`));
console.log('');
console.log(chalk.cyan('new SynthControlMessage()'));
console.log(chalk.yellow(`${new SynthControlMessage()}`));
console.log('');
console.log(chalk.cyan("new SynthControlMessage({ p: 'freq', l: 4, v: 440 })"));
console.log(chalk.yellow(`${new SynthControlMessage({ p: 'freq', l: 4, v: 440 })}`));
console.log('');
console.log(chalk.cyan("new SynthControlMessage({ param: 'gain', length: 0.05, value: -0.352 })"));
console.log(chalk.yellow(`${new SynthControlMessage({ param: 'gain', length: 0.05, value: -0.352 })}`));
console.log('');
console.log(chalk.cyan(`new SynthControlArray([
  { param: 'freq', length: 2, value: 330 },
  { p: 'gain', l: 0.05, v: -0.1923 },
])`));
console.log(chalk.yellow(`${new SynthControlArray([
  { param: 'freq', length: 2, value: 330 },
  { p: 'gain', l: 0.05, v: -0.1923 },
])}`));
console.log('');
console.log(chalk.cyan(`new SynthControlArray([
  'invalid item',
  { invalid: 'object' },
  { param: 'delay', length: 48, value: 0.00523 },
  { p: 'freq', l: 4, v: 330 },
  { p: 'freq', l: 2, v: 440 },
  { p: 'freq', l: 3, v: 551 },
  { p: 'freq', l: 7, v: 549 },
])`));
console.log(chalk.yellow(`${new SynthControlArray([
  'invalid item',
  { invalid: 'object' },
  { param: 'delay', length: 48, value: 0.00523 },
  { p: 'freq', l: 4, v: 330 },
  { p: 'freq', l: 2, v: 440 },
  { p: 'freq', l: 3, v: 551 },
  { p: 'freq', l: 7, v: 549 },
])}`));
console.log('');
console.log(chalk.magenta('**************************************************************'));
console.log('');

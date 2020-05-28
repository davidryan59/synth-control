/* eslint-disable no-console */

import chalk from 'chalk';

import { SynthControlArray, SynthControlMessage } from '../src';

const arr = [];
console.log('');
console.log('');
console.log('');
console.log(chalk.magenta(`*************** Running ${chalk.bold('synth-control')} examples ***************`));
console.log('');
console.log(chalk.cyan('object code'));
console.log(chalk.yellow('object.toString'));
console.log('console.log(object)');
console.log('');
console.log(chalk.cyan('new SynthControlMessage()'));
console.log(chalk.yellow(`${arr[0] = new SynthControlMessage()}`));
console.log(arr[0]);
console.log('');
console.log(chalk.cyan("new SynthControlMessage({ p: 'freq', d: 4, v: 440 })"));
console.log(chalk.yellow(`${arr[1] = new SynthControlMessage({ p: 'freq', d: 4, v: 440 })}`));
console.log(arr[1]);
console.log('');
console.log('');
console.log(chalk.cyan("new SynthControlMessage({ param: 'gain', duration: 0.05, value: -0.352 }).setStartTime(42)"));
console.log(chalk.yellow(`${arr[2] = new SynthControlMessage({ param: 'gain', duration: 0.05, value: -0.352 }).setStartTime(42)}`));
console.log(arr[2]);
console.log('');
console.log('');
console.log(chalk.cyan(`new SynthControlArray([
  { param: 'freq', duration: 2, value: 330 },
  { p: 'gain', d: 0.05, v: -0.1923 },
])`));
console.log('');
console.log(chalk.yellow(`${arr[3] = new SynthControlArray([
  { param: 'freq', duration: 2, value: 330 },
  { p: 'gain', d: 0.05, v: -0.1923 },
])}`));
console.log('');
console.log(arr[3]);
console.log('');
console.log('');
console.log(chalk.cyan(`new SynthControlArray([
  'invalid item',
  { invalid: 'object' },
  { param: 'delay', dur: 48, val: 0.00523, extraKey: 'hello world' },
  { param: 'freq', duration: 4, start: 330, end: 400 },
  { p: 'freq', d: 2, v: 440 },
  { p: 'freq', d: 3, v: 551 },
  { p: 'freq', d: 7, v: 549 },
])`));
console.log('');
console.log(chalk.yellow(`${arr[4] = new SynthControlArray([
  'invalid item',
  { invalid: 'object' },
  {
    param: 'delay', dur: 48, val: 0.00523, extraKey: 'hello world',
  },
  {
    param: 'freq', duration: 4, start: 330, end: 400,
  },
  { p: 'freq', d: 2, v: 440 },
  { p: 'freq', d: 3, v: 551 },
  { p: 'freq', d: 7, v: 549 },
])}`));
console.log('');
console.log(arr[4]);
console.log('');
console.log(chalk.magenta('**************************************************************'));
console.log('');
console.log('');
console.log('');

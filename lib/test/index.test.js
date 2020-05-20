import { SynthControlMessage, packageName } from '../src';

test('test SynthControlMessage in index.js', () => {
  const scm = new SynthControlMessage();
  expect(!!scm).toBeTruthy();
});

test('test packageName in index.js', () => {
  expect(packageName).toEqual('synth-control');
});

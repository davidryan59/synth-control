import { SynthControlArray, SynthControlMessage, packageName } from '../src';

test('test SynthControlArray in index.js', () => {
  const sca = new SynthControlArray();
  expect(!!sca).toBeTruthy();
});

test('test SynthControlMessage in index.js', () => {
  const scm = new SynthControlMessage();
  expect(!!scm).toBeTruthy();
});

test('test packageName in index.js', () => {
  expect(packageName).toEqual('synth-control');
});

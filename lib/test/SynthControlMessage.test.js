import SynthControlMessage from '../src/SynthControlMessage';

test('test empty constructor', () => {
  const scm = new SynthControlMessage();
  expect(!!scm).toBeTruthy();
});

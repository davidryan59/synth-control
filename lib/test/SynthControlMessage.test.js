import SynthControlMessage from '../src/SynthControlMessage';

// Test fixtures: tf
const tf = {};

beforeEach(() => {
  tf.scm0 = new SynthControlMessage('invalid data');
  tf.scm1 = new SynthControlMessage({
    param: 'freq',
    length: 4,
    value: 440,
    badKey: 'badValue',
  });
  tf.scm2 = new SynthControlMessage({
    p: 'gain',
    l: 1.678678678678,
    v: -0.567567567567,
  });
  tf.scm2a = new SynthControlMessage({
    p: 'gain',
    l: -1.678678678678, // negative length is invalid
    v: -0.567567567567,
  });
  tf.scm3 = new SynthControlMessage({
    param: 'delay',
    len: 4,
    start: 0.0345,
    end: 0.0678,
  });
});

test('', () => { expect(tf.scm0.param).toEqual(''); });
test('', () => { expect(tf.scm0.length).toEqual(0); });
test('', () => { expect(tf.scm0.value).toEqual(0); });
test('', () => { expect(tf.scm0.anotherKey).toBeUndefined(); });
test('', () => { expect(tf.scm0.toString()).toEqual("SynthControlMessage: param '', length 0, value 0"); });

test('', () => { expect(tf.scm1.param).toEqual('freq'); });
test('', () => { expect(tf.scm1.length).toEqual(4); });
test('', () => { expect(tf.scm1.value).toEqual(440); });
test('', () => { expect(tf.scm1.badKey).toBeUndefined(); });
test('', () => { expect(tf.scm1.anotherKey).toBeUndefined(); });
test('', () => { expect(tf.scm1.toString()).toEqual("SynthControlMessage: param 'freq', length 4, value 440"); });

test('', () => { expect(tf.scm2.param).toEqual('gain'); });
test('', () => { expect(tf.scm2.length).toEqual(1.678678678678); });
test('', () => { expect(tf.scm2.value).toEqual(-0.567567567567); });
test('', () => { expect(tf.scm2.anotherKey).toBeUndefined(); });
test('', () => { expect(tf.scm2.toString()).toEqual("SynthControlMessage: param 'gain', length 1.678678678678, value -0.567567567567"); });

test('Negative lengths not allowed', () => { expect(tf.scm2a.length).toEqual(0); });

test('', () => { expect(tf.scm3.param).toEqual('delay'); });
test('', () => { expect(tf.scm3.length).toEqual(4); });
test('', () => { expect(tf.scm3.value).toEqual(0.0345); });
test('', () => { expect(tf.scm3.valueEnd).toEqual(0.0678); });
test('', () => { expect(tf.scm3.toString()).toEqual("SynthControlMessage: param 'delay', length 4, values 0.0345 to 0.0678"); });

test('Cannot add a key', () => {
  try { tf.scm0.newKey = 'newValue'; } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.scm0.newKey).toBeUndefined();
});

test('Cannot edit param', () => {
  try { tf.scm0.p = 'newParam'; } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.scm0.p).toEqual('');
});

test('Cannot edit length', () => {
  try { tf.scm0.l = 5.67; } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.scm0.l).toEqual(0);
});

test('Cannot edit value', () => {
  try { tf.scm0.v = -42.001; } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.scm0.v).toEqual(0);
});

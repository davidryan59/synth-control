import isString from 'is-string';

import privateSet from '../src/privateSet';

// Test fixtures: tf
const tf = {};
const arr = [null, -5, 'string1', 0, 3.045, 1.023];

beforeEach(() => {
  privateSet(tf, 'a', arr, (v) => Number.isFinite(v) && v > 0);
  privateSet(tf, 'b', arr, (v) => Number.isFinite(v));
  privateSet(tf, 'c', arr, (v) => isString(v));
  privateSet(tf, 'd', arr, () => true);
  privateSet(tf, 'e', arr, () => null);
  privateSet(tf, 'f', 'invalid array', (v) => isString(v));
  privateSet(tf, 'g', arr, 'invalid function');
});

test('', () => { expect(tf.a).toEqual(3.045); });
test('', () => { expect(tf.b).toEqual(-5); });
test('', () => { expect(tf.c).toEqual('string1'); });
test('', () => { expect(tf.d).toEqual(null); });
test('', () => { expect(tf.e).toBeUndefined(); });
test('', () => { expect(tf.f).toBeUndefined(); });
test('', () => { expect(tf.g).toBeUndefined(); });

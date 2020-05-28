import SynthControlArray from '../src/SynthControlArray';

// Test fixtures: tf
const tf = {};

beforeEach(() => {
  tf.sca_emp = new SynthControlArray();
  tf.sca_inv = new SynthControlArray('invalid data');
  tf.sca_emp_arr = new SynthControlArray([]);
  tf.sca1 = new SynthControlArray([{ p: 'test', d: 1.23, v: -0.5432 }]);
  tf.sca3 = new SynthControlArray([
    { p: 'freq', d: 4, v: 275 },
    {
      p: 'gain', d: 3, v: 5, vE: 7,
    },
    {
      p: 'freq2', d: 2, v: 120, vE: 125,
    },
  ]);
  tf.sca5 = new SynthControlArray([
    tf.sca1.get(0),
    { p: 'test2', d: 1.5, v: -999 },
    tf.sca3,
  ]);
  tf.sca6 = new SynthControlArray([
    { param: 'freq', dur: 4, val: 345 },
    { invalid: 'object' },
    { p: 'gain', d: 3.67586758, v: -0.76867686 },
    'invalid item',
    { p: 'gain', d: -3.67586758, v: -0.76867686 },
    { param: 'freq', duration: 2, value: 355 },
  ]);
});

// Test .length
test('', () => { expect(tf.sca_emp.length).toEqual(0); });
test('', () => { expect(tf.sca_inv.length).toEqual(0); });
test('', () => { expect(tf.sca_emp_arr.length).toEqual(0); });
test('', () => { expect(tf.sca1.length).toEqual(1); });
test('', () => { expect(tf.sca3.length).toEqual(3); });
test('', () => { expect(tf.sca5.length).toEqual(5); });
test('', () => { expect(tf.sca6.length).toEqual(6); });

// Test .get
test('', () => { expect(tf.sca5.get(1).param).toEqual('test2'); });
test('', () => { expect(tf.sca6.get(5).value).toEqual(355); });

// Check SCA constructor works with multiple types in the array
// e.g. an SCM, then an object (for SCM construction), then an SCA
test('', () => { expect(tf.sca5.get(0).value).toEqual(-0.5432); });
test('', () => { expect(tf.sca5.get(1).value).toEqual(-999); });
test('', () => { expect(tf.sca5.get(2).value).toEqual(275); });

// Test .toString
test('', () => { expect(tf.sca_emp.toString()).toEqual('SynthControlArray, length 0'); });
test('', () => {
  expect(tf.sca1.toString()).toEqual(`SynthControlArray, length 1:
  SynthControlMessage: param 'test', duration 1.23, value -0.5432`);
});
test('', () => {
  expect(tf.sca6.toString()).toEqual(`SynthControlArray, length 6:
  SynthControlMessage: param 'freq', duration 4, value 345
  SynthControlMessage: param '', duration 0, value 0
  SynthControlMessage: param 'gain', duration 3.6758676, value -0.768677
  SynthControlMessage: param '', duration 0, value 0
  ...
  SynthControlMessage: param 'freq', duration 2, value 355`);
});

// Check that existing instances cannot be edited
test('Cannot add a key', () => {
  try { tf.sca1.newKey = 'newValue'; } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.sca1.newKey).toBeUndefined();
});

test('Cannot edit param', () => {
  try { tf.sca_emp_arr.array = [1]; } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.sca_emp_arr.array).toEqual([]);
});

test('Cannot add to array', () => {
  try { tf.sca_emp_arr.array.push(1); } catch (e) {} /* eslint-disable-line no-empty */
  expect(tf.sca_emp_arr.array).toEqual([]);
});

// Test .map
let mapSca;
test('Map with no parameters', () => {
  mapSca = tf.sca3.map();
  expect(mapSca).toBe(tf.sca3);
});

test('Map with empty object', () => {
  mapSca = tf.sca3.map({});
  expect(mapSca).toBe(tf.sca3);
});

test('Map with empty array', () => {
  mapSca = tf.sca3.map([]);
  expect(mapSca).toBe(tf.sca3);
});

test('Rename a specific parameter', () => {
  mapSca = tf.sca3.map({ type: 'rename', old: 'freq2', new: 'freq' });
  expect(mapSca.get(1).param).toEqual('gain'); // not changed
  expect(mapSca.get(2).param).toEqual('freq'); // changed
});

test('Change a duration for all parameters', () => {
  mapSca = tf.sca3.map({ type: 'duration', op: '*', num: 7 });
  expect(mapSca.get(0).duration).toEqual(4 * 7);
  expect(mapSca.get(1).duration).toEqual(3 * 7);
  expect(mapSca.get(2).duration).toEqual(2 * 7);
});

test('Change a value for two parameters only', () => {
  mapSca = tf.sca3.map({
    type: 'value', op: '+', num: 29, params: ['gain', 'freq'],
  });
  expect(mapSca.get(0).value).toEqual(275 + 29); // these changed
  expect(mapSca.get(0).valueEnd).toBeUndefined();
  expect(mapSca.get(1).value).toEqual(5 + 29);
  expect(mapSca.get(1).valueEnd).toEqual(7 + 29);
  expect(mapSca.get(2).value).toEqual(120); // these unchanged
  expect(mapSca.get(2).valueEnd).toEqual(125);
});

test('Reverse order of an SCA', () => {
  mapSca = tf.sca3.map({ type: 'reverse' });
  expect(mapSca.get(0).param).toEqual('freq2');
  expect(mapSca.get(1).duration).toEqual(3);
  expect(mapSca.get(2).value).toEqual(275);
});

test('Keep 2 out of 3 SCMs in SCA', () => {
  mapSca = tf.sca3.map({ type: 'keep', params: ['freq2', 'freq'] });
  expect(mapSca.length).toEqual(2);
  expect(mapSca.get(0).param).toEqual('freq');
  expect(mapSca.get(1).param).toEqual('freq2');
});

test('Remove 2 out of 3 SCMs in SCA', () => {
  mapSca = tf.sca3.map({ type: 'remove', params: ['freq', 'freq2'] });
  expect(mapSca.length).toEqual(1);
  expect(mapSca.get(0).param).toEqual('gain');
});

test('Change a duration, using array (length 1) of maps', () => {
  mapSca = tf.sca3.map([
    {
      type: 'duration', op: '*', num: 5, params: ['freq'],
    },
  ]);
  expect(mapSca.get(0).duration).toEqual(4 * 5); // changed
  expect(mapSca.get(1).duration).toEqual(3); // unchanged
});

test('Combine two maps using array', () => {
  mapSca = tf.sca3.map([
    {
      type: 'value', op: '+', num: 123, params: ['freq2'],
    },
    {
      type: 'duration', op: '*', num: 345, params: ['gain'],
    },
  ]);
  expect(mapSca.get(0).duration).toEqual(4);
  expect(mapSca.get(0).value).toEqual(275);
  expect(mapSca.get(0).valueEnd).toBeUndefined();
  expect(mapSca.get(1).duration).toEqual(3 * 345);
  expect(mapSca.get(1).value).toEqual(5);
  expect(mapSca.get(1).valueEnd).toEqual(7);
  expect(mapSca.get(2).duration).toEqual(2);
  expect(mapSca.get(2).value).toEqual(120 + 123);
  expect(mapSca.get(2).valueEnd).toEqual(125 + 123);
});

// Test .map type 'flip'
test('Flip without params array flips every SCM with valueEnd', () => {
  mapSca = tf.sca3.map({ type: 'flip' });
  expect(mapSca.get(0).value).toEqual(275); // not flipped
  expect(mapSca.get(0).valueEnd).toBeUndefined();
  expect(mapSca.get(1).value).toEqual(7); // Flipped
  expect(mapSca.get(1).valueEnd).toEqual(5);
  expect(mapSca.get(2).value).toEqual(125); // Flipped
  expect(mapSca.get(2).valueEnd).toEqual(120);
});

test('Flip with params array flips only SCM with valueEnd and matching param', () => {
  mapSca = tf.sca3.map({ type: 'flip', params: ['gain'] });
  expect(mapSca.get(0).value).toEqual(275); // not flipped
  expect(mapSca.get(0).valueEnd).toBeUndefined();
  expect(mapSca.get(1).value).toEqual(7); // Flipped
  expect(mapSca.get(1).valueEnd).toEqual(5);
  expect(mapSca.get(2).value).toEqual(120); // not flipped
  expect(mapSca.get(2).valueEnd).toEqual(125);
});

// Edge cases for .map on SCA
test('Keep without params array returns SCA unchanged', () => {
  mapSca = tf.sca3.map({ type: 'keep' });
  expect(mapSca).toBe(tf.sca3);
});
test('Remove without params array returns SCA unchanged', () => {
  mapSca = tf.sca3.map({ type: 'remove' });
  expect(mapSca).toBe(tf.sca3);
});

import SynthControlArray from '../src/SynthControlArray';

// Test fixtures: tf
const tf = {};

beforeEach(() => {
  tf.sca_emp = new SynthControlArray();
  tf.sca_inv = new SynthControlArray('invalid data');
  tf.sca_emp_arr = new SynthControlArray([]);
  tf.sca1 = new SynthControlArray([{ p: 'test', l: 1.23, v: -0.5432 }]);
  tf.sca3 = new SynthControlArray([
    { p: 'freq', l: 4, v: 275 },
    {
      p: 'gain', l: 3, v: 5, vE: 7,
    },
    {
      p: 'freq2', l: 2, v: 120, vE: 125,
    },
  ]);
  // tf.sca3a = tf.sca3.mapValues({
  //   params: ['freq2', 'gain'],
  //   fn: (v) => 3 * v,
  // });
  tf.sca5 = new SynthControlArray([
    tf.sca1.array[0],
    { p: 'test2', l: 1.5, v: -999 },
    tf.sca3,
  ]);
  tf.sca6 = new SynthControlArray([
    { param: 'freq', length: 4, value: 345 },
    { invalid: 'object' },
    { p: 'gain', l: 3.67586758, v: -0.76867686 },
    'invalid item',
    { p: 'gain', l: -3.67586758, v: -0.76867686 },
    { param: 'freq', length: 2, value: 355 },
  ]);
});

test('', () => { expect(tf.sca_emp.length).toEqual(0); });
test('', () => { expect(tf.sca_inv.length).toEqual(0); });
test('', () => { expect(tf.sca_emp_arr.length).toEqual(0); });
test('', () => { expect(tf.sca1.length).toEqual(1); });
test('', () => { expect(tf.sca6.length).toEqual(6); });

// Check SCA constructor with SCM, object, SCA
test('', () => { expect(tf.sca5.array[0].value).toEqual(-0.5432); });
test('', () => { expect(tf.sca5.array[1].value).toEqual(-999); });
test('', () => { expect(tf.sca5.array[2].value).toEqual(275); });

// .toString
test('', () => { expect(tf.sca_emp.toString()).toEqual('SynthControlArray, length 0'); });
test('', () => {
  expect(tf.sca1.toString()).toEqual(`SynthControlArray, length 1:
  SynthControlMessage: param 'test', length 1.23, value -0.5432`);
});
test('', () => {
  expect(tf.sca6.toString()).toEqual(`SynthControlArray, length 6:
  SynthControlMessage: param 'freq', length 4, value 345
  SynthControlMessage: param '', length 0, value 0
  SynthControlMessage: param 'gain', length 3.67586758, value -0.76867686
  SynthControlMessage: param '', length 0, value 0
  ...
  SynthControlMessage: param 'freq', length 2, value 355`);
});

// Edge cases
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

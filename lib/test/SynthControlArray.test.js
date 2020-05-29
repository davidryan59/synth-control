import SynthControlArray from '../src/SynthControlArray';

// Helper function to compare strings by removing all whitespace (CR, LF, Space)
const rws = (string) => string.replace(/ |\r?\n|\r/g, '');

// Test fixtures are tf

describe('Test SCA constructed with no data', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca_emp = new SynthControlArray();
  });
  test('', () => { expect(tf.sca_emp.length).toEqual(0); });
  test('', () => { expect(tf.sca_emp.toString()).toEqual('SynthControlArray, length 0'); });
});


describe('Test SCA constructed with invalid data', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca_inv = new SynthControlArray('invalid data');
  });
  test('', () => { expect(tf.sca_inv.length).toEqual(0); });
});


describe('Test SCA constructed with empty array', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca_emp_arr = new SynthControlArray([]);
  });
  test('', () => { expect(tf.sca_emp_arr.length).toEqual(0); });
  test('Cannot replace array a', () => {
    try { tf.sca_emp_arr.a = [1]; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.sca_emp_arr.a).toEqual([]);
  });
  test('Cannot edit array a', () => {
    try { tf.sca_emp_arr.a[0] = 'test'; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.sca_emp_arr.a).toEqual([]);
  });
  test('Cannot add to array a', () => {
    try { tf.sca_emp_arr.a.push(1); } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.sca_emp_arr.a).toEqual([]);
  });
  test('Can add to cache c', () => {
    try { tf.sca_emp_arr.c.test = 'val'; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.sca_emp_arr.c).toEqual({ test: 'val' });
  });
});


describe('Test SCA constructed with array of (construction data for) 1 SCM', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca1 = new SynthControlArray([{ p: 'test', d: 1.23, v: -0.5432 }]);
  });
  test('', () => { expect(tf.sca1.length).toEqual(1); });
  test('', () => {
    expect(rws(tf.sca1.toString())).toEqual(rws(`SynthControlArray, length 1:
      SynthControlMessage: param 'test', duration 1.23, value -0.5432`));
  });
  test('Cannot add a key', () => {
    try { tf.sca1.newKey = 'newValue'; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.sca1.newKey).toBeUndefined();
  });
});


describe('Test SCA constructed with array of SCM, SCM data, SCA', () => {
  const tf = {};
  beforeEach(() => {
    tf.anSca = new SynthControlArray([{ p: 'test', d: 1.23, v: -0.5432 }]);
    tf.anotherSca = new SynthControlArray([
      { p: 'freq', d: 4, v: 275 },
      {
        p: 'gain', d: 3, v: 5, vE: 7,
      },
      {
        p: 'freq2', d: 2, v: 120, vE: 125,
      },
    ]);
    tf.sca5 = new SynthControlArray([
      tf.anSca.get(0),
      { p: 'test2', d: 1.5, v: -999 },
      tf.anotherSca,
    ]);
  });
  test('', () => { expect(tf.sca5.length).toEqual(5); });
  test('', () => { expect(tf.sca5.get(1).param).toEqual('test2'); });
  test('', () => { expect(tf.sca5.get(0).value).toEqual(-0.5432); });
  test('', () => { expect(tf.sca5.get(1).value).toEqual(-999); });
  test('', () => { expect(tf.sca5.get(2).value).toEqual(275); });
});


describe('Test SCA constructed with array of valid and invalid data', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca6 = new SynthControlArray([
      { param: 'freq', dur: 4, val: 345 },
      { invalid: 'object' },
      { p: 'gain', d: 3.67586758, v: -0.76867686 },
      'invalid item',
      { p: 'gain', d: -3.67586758, v: -0.76867686 },
      { param: 'freq', duration: 2, value: 355 },
    ]);
  });
  test('', () => { expect(tf.sca6.length).toEqual(6); });
  test('', () => { expect(tf.sca6.get(5).value).toEqual(355); });
  test('', () => {
    expect(rws(tf.sca6.toString())).toEqual(rws(`SynthControlArray, length 6:
      SynthControlMessage: param 'freq', duration 4, value 345
      SynthControlMessage: param '', duration 0, value 0
      SynthControlMessage: param 'gain', duration 3.6758676, value -0.768677
      SynthControlMessage: param '', duration 0, value 0
      ...
      SynthControlMessage: param 'freq', duration 2, value 355`));
  });
});


describe('Test thoroughly an SCA constructed with 3 data items', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca3 = new SynthControlArray([
      { p: 'freq', d: 4, v: 275 },
      {
        p: 'gain', d: 3, v: 5, vE: 7,
      },
      {
        p: 'freq2', d: 2, v: 120, vE: 125,
      },
    ]);
  });
  test('', () => { expect(tf.sca3.length).toEqual(3); });
  // Test .map
  test('Map with no parameters', () => {
    const mapSca = tf.sca3.map();
    expect(mapSca).toBe(tf.sca3);
  });
  test('Map with empty object', () => {
    const mapSca = tf.sca3.map({});
    expect(mapSca).toBe(tf.sca3);
  });
  test('Map with empty array', () => {
    const mapSca = tf.sca3.map([]);
    expect(mapSca).toBe(tf.sca3);
  });
  test('Rename a specific parameter', () => {
    const mapSca = tf.sca3.map({ type: 'rename', old: 'freq2', new: 'freq' });
    expect(mapSca.get(1).param).toEqual('gain'); // not changed
    expect(mapSca.get(2).param).toEqual('freq'); // changed
  });
  test('Change a duration for all parameters', () => {
    const mapSca = tf.sca3.map({ type: 'duration', op: '*', num: 7 });
    expect(mapSca.get(0).duration).toEqual(4 * 7);
    expect(mapSca.get(1).duration).toEqual(3 * 7);
    expect(mapSca.get(2).duration).toEqual(2 * 7);
  });
  test('Change a value for two parameters only', () => {
    const mapSca = tf.sca3.map({
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
    const mapSca = tf.sca3.map({ type: 'reverse' });
    expect(mapSca.get(0).param).toEqual('freq2');
    expect(mapSca.get(1).duration).toEqual(3);
    expect(mapSca.get(2).value).toEqual(275);
  });
  test('Keep 2 out of 3 SCMs in SCA', () => {
    const mapSca = tf.sca3.map({ type: 'keep', params: ['freq2', 'freq'] });
    expect(mapSca.length).toEqual(2);
    expect(mapSca.get(0).param).toEqual('freq');
    expect(mapSca.get(1).param).toEqual('freq2');
  });
  test('Remove 2 out of 3 SCMs in SCA', () => {
    const mapSca = tf.sca3.map({ type: 'remove', params: ['freq', 'freq2'] });
    expect(mapSca.length).toEqual(1);
    expect(mapSca.get(0).param).toEqual('gain');
  });
  test('Change a duration, using array (length 1) of maps', () => {
    const mapSca = tf.sca3.map([
      {
        type: 'duration', op: '*', num: 5, params: ['freq'],
      },
    ]);
    expect(mapSca.get(0).duration).toEqual(4 * 5); // changed
    expect(mapSca.get(1).duration).toEqual(3); // unchanged
  });
  test('Combine two maps using array', () => {
    const mapSca = tf.sca3.map([
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
  test('Flip without params array flips every SCM with valueEnd', () => {
    const mapSca = tf.sca3.map({ type: 'flip' });
    expect(mapSca.get(0).value).toEqual(275); // not flipped
    expect(mapSca.get(0).valueEnd).toBeUndefined();
    expect(mapSca.get(1).value).toEqual(7); // Flipped
    expect(mapSca.get(1).valueEnd).toEqual(5);
    expect(mapSca.get(2).value).toEqual(125); // Flipped
    expect(mapSca.get(2).valueEnd).toEqual(120);
  });
  test('Flip with params array flips only SCM with valueEnd and matching param', () => {
    const mapSca = tf.sca3.map({ type: 'flip', params: ['gain'] });
    expect(mapSca.get(0).value).toEqual(275); // not flipped
    expect(mapSca.get(0).valueEnd).toBeUndefined();
    expect(mapSca.get(1).value).toEqual(7); // Flipped
    expect(mapSca.get(1).valueEnd).toEqual(5);
    expect(mapSca.get(2).value).toEqual(120); // not flipped
    expect(mapSca.get(2).valueEnd).toEqual(125);
  });
  // Test .map edge cases
  test('Keep without params array returns SCA unchanged', () => {
    const mapSca = tf.sca3.map({ type: 'keep' });
    expect(mapSca).toBe(tf.sca3);
  });
  test('Remove without params array returns SCA unchanged', () => {
    const mapSca = tf.sca3.map({ type: 'remove' });
    expect(mapSca).toBe(tf.sca3);
  });
});


describe('Test caching and timing on SCA constructed with 9 data items', () => {
  const tf = {};
  beforeEach(() => {
    tf.sca9 = new SynthControlArray([
      { p: 'f1', d: 1, v: 420 },
      { p: 'f2', d: 2, v: 430 },
      { p: 'f3', d: 3, v: 440 },
      { p: 'f1', d: 4, v: 450 },
      { p: 'f2', d: 5, v: 460 },
      { p: 'f3', d: 6, v: 470 },
      { p: 'f1', d: 7, v: 480 },
      { p: 'f2', d: 8, v: 490 },
      { p: 'f1', d: 9, v: 500 },
    ]);
  });
  // New SCA
  test('', () => expect(tf.sca9.hasStructure).toBeFalsy());
  test('', () => expect(tf.sca9.hasTimeSet).toBeFalsy());
  test('', () => expect(tf.sca9.startTime).toEqual(0));
  test('', () => expect(tf.sca9.endTime).toEqual(21));
  test('', () => expect(tf.sca9.duration).toEqual(21)); // 1 + 4 + 7 + 9 from param f1
  test('', () => expect(tf.sca9.params).toEqual(['f1', 'f2', 'f3']));
  test('', () => expect(tf.sca9.durationsByParam.f1).toEqual(21));
  test('', () => expect(tf.sca9.durationsByParam.f2).toEqual(15));
  test('', () => expect(tf.sca9.durationsByParam.f3).toEqual(9));
  test('', () => expect(tf.sca9.messagesByParam.f1.length).toEqual(4));
  test('', () => expect(tf.sca9.messagesByParam.f2[1].value).toEqual(460));
  // SCA after caching structure
  test('', () => expect(tf.sca9.cacheStructure()).toBe(tf.sca9));
  test('', () => expect(tf.sca9.cacheStructure().hasStructure).toBeTruthy());
  test('', () => expect(tf.sca9.cacheStructure().hasTimeSet).toBeFalsy());
  // SCA after invalid setStartTime call
  test('', () => expect(tf.sca9.setStartTime()).toBe(tf.sca9));
  test('', () => expect(tf.sca9.setStartTime().hasStructure).toBeFalsy());
  test('', () => expect(tf.sca9.setStartTime().hasTimeSet).toBeFalsy());
  // SCA after valid setStartTime call
  test('', () => expect(tf.sca9.setStartTime(-13)).toBe(tf.sca9));
  test('', () => expect(tf.sca9.setStartTime(-13).hasStructure).toBeTruthy());
  test('', () => expect(tf.sca9.setStartTime(-13).hasTimeSet).toBeTruthy());
  test('', () => expect(tf.sca9.setStartTime(-13).duration).toEqual(21));
  test('', () => expect(tf.sca9.setStartTime(-13).startTime).toEqual(-13));
  test('', () => expect(tf.sca9.setStartTime(-13).endTime).toEqual(8));
  // Check can set time twice, and 2nd change is retained
  test('', () => expect(tf.sca9.setStartTime(-13).setStartTime(352.43002)).toBe(tf.sca9));
  test('', () => expect(tf.sca9.setStartTime(-13).setStartTime(352.43002).hasStructure).toBeTruthy());
  test('', () => expect(tf.sca9.setStartTime(-13).setStartTime(352.43002).hasTimeSet).toBeTruthy());
  test('', () => expect(tf.sca9.setStartTime(-13).setStartTime(352.43002).duration).toEqual(21));
  test('', () => expect(tf.sca9.setStartTime(-13).setStartTime(352.43002).startTime).toEqual(352.43002));
  test('', () => expect(tf.sca9.setStartTime(-13).setStartTime(352.43002).endTime).toEqual(373.43002));
});

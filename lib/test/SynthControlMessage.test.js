import SynthControlMessage from '../src/SynthControlMessage';

// Test fixtures are tf

describe('Test SCM constructed with invalid data', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm0 = new SynthControlMessage('invalid data');
  });
  test('', () => { expect(tf.scm0.param).toEqual(''); });
  test('', () => { expect(tf.scm0.duration).toEqual(0); });
  test('', () => { expect(tf.scm0.value).toEqual(0); });
  test('', () => { expect(tf.scm0.valueEnd).toEqual(0); });
  test('', () => { expect(tf.scm0.anotherKey).toBeUndefined(); });
  test('', () => { expect(tf.scm0.toString()).toEqual("SynthControlMessage: param '', duration 0, value 0"); });
  // Check existing instances cannot be edited (except for cache)
  test('Cannot add a key', () => {
    try { tf.scm0.newKey = 'newValue'; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.scm0.newKey).toBeUndefined();
  });
  test('Cannot edit param', () => {
    try { tf.scm0.p = 'newParam'; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.scm0.p).toEqual('');
  });
  test('Cannot edit duration', () => {
    try { tf.scm0.d = 5.67; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.scm0.d).toEqual(0);
  });
  test('Cannot edit value', () => {
    try { tf.scm0.v = -42.001; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.scm0.v).toEqual(0);
  });
  test('CAN edit contents of cache', () => {
    try { tf.scm0.c.newKey = 'added item'; } catch (e) {} /* eslint-disable-line no-empty */
    expect(tf.scm0.c.newKey).toEqual('added item');
  });
});


describe('Test SCM constructed with (mostly) good data', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm1 = new SynthControlMessage({
      param: 'freq',
      duration: 4,
      value: 440,
      badKey: 'badValue',
    });
  });
  test('', () => { expect(tf.scm1.param).toEqual('freq'); });
  test('', () => { expect(tf.scm1.duration).toEqual(4); });
  test('', () => { expect(tf.scm1.value).toEqual(440); });
  test('', () => { expect(tf.scm1.valueEnd).toEqual(440); });
  test('', () => { expect(tf.scm1.badKey).toBeUndefined(); });
  test('', () => { expect(tf.scm1.anotherKey).toBeUndefined(); });
  test('', () => { expect(tf.scm1.toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440"); });
  test('', () => { expect(tf.scm1.isConstant).toBeTruthy(); });
  // Test .map
  test('', () => {
    expect(tf.scm1.map(
      { type: 'invalidType' },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'duration', op: 'invalidOp', num: 2 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'duration', op: '+', num: 2 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 6, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      {
        type: 'duration', op: '+', num: 2, params: [],
      },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      {
        type: 'duration', op: '+', num: 2, params: ['freq'],
      },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 6, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'value', op: 'invalidOp', num: 5 / 4 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'value', op: '*', num: 5 / 4 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 550");
  });
  test('', () => {
    expect(tf.scm1.map(
      {
        type: 'value', op: '*', num: 5 / 4, params: [],
      },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      {
        type: 'value', op: '*', num: 5 / 4, params: ['freq2', 'freq'],
      },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 550");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'rename', old: 'freq', new: 'fm' },
    ).toString()).toEqual("SynthControlMessage: param 'fm', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'rename', old: 'freq2', new: 'fm' },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map([
      { type: 'value', op: '+', num: -40 },
      { type: 'duration', op: '+', num: -3 },
      { type: 'invalid type does nothing' },
      { type: 'rename', old: 'freq', new: 'freq2' },
      { type: 'value', op: '*', num: 0.5 },
    ]).toString()).toEqual("SynthControlMessage: param 'freq2', duration 1, value 200");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'flip' },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  test('', () => {
    expect(tf.scm1.map(
      { type: 'flip', params: ['delay'] },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, value 440");
  });
  // Test .map edge cases
  test('', () => { expect(tf.scm1.map([])).toBe(tf.scm1); });
  test('', () => { expect(tf.scm1.map('invalid map data')).toBe(tf.scm1); });
  test('', () => { expect(tf.scm1.rename('invalid data')).toBe(tf.scm1); });
  test('', () => { expect(tf.scm1.mapValue('invalid data')).toBe(tf.scm1); });
  test('', () => { expect(tf.scm1.mapDuration('invalid data')).toBe(tf.scm1); });
  test('', () => { expect(tf.scm1.mapFlip('invalid data')).toBe(tf.scm1); });
});


describe('Test SCM constructed with different start and end values', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm1a = new SynthControlMessage({
      param: 'freq',
      dur: 4,
      start: 360,
      end: 480,
    });
  });
  test('', () => {
    expect(tf.scm1a.map(
      { type: 'value', op: '-', num: 420 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, values 60 to -60");
  });
  test('', () => {
    expect(tf.scm1a.map(
      { type: 'value', op: '/', num: 72000 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, values 200 to 150");
  });
  test('', () => {
    expect(tf.scm1a.map(
      { type: 'value', op: 'max', num: 420 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, values 420 to 480");
  });
  test('', () => {
    expect(tf.scm1a.map(
      { type: 'value', op: 'min', num: 420 },
    ).toString()).toEqual("SynthControlMessage: param 'freq', duration 4, values 360 to 420");
  });
});


describe('Test SCM constructed with decimal duration and value', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm2 = new SynthControlMessage({
      p: 'gain',
      d: 1.678678678678,
      v: -0.567567567567,
    });
  });
  test('', () => { expect(tf.scm2.param).toEqual('gain'); });
  test('', () => { expect(tf.scm2.duration).toEqual(1.678678678678); });
  test('', () => { expect(tf.scm2.value).toEqual(-0.567567567567); });
  test('', () => { expect(tf.scm2.valueEnd).toEqual(-0.567567567567); });
  test('', () => { expect(tf.scm2.anotherKey).toBeUndefined(); });
  // Test .toString before and after start time set
  test('', () => { expect(tf.scm2.toString()).toEqual("SynthControlMessage: param 'gain', duration 1.6786787, value -0.567568"); });
  test('', () => { expect(tf.scm2.setTimeStart(-1 / 23).toString()).toEqual("SynthControlMessage: param 'gain', time -0.043478 to 1.6352004 (duration 1.6786787), value -0.567568"); });
  // Check unary operation on value and duration
  test('', () => {
    expect(tf.scm2.map(
      { type: 'value', op: 'abs' },
    ).toString()).toEqual("SynthControlMessage: param 'gain', duration 1.6786787, value 0.5675676");
  });
  test('', () => {
    expect(tf.scm2.map(
      { type: 'duration', op: 'abs' },
    ).toString()).toEqual("SynthControlMessage: param 'gain', duration 1.6786787, value -0.567568");
  });
});


describe('Test SCM constructed with negative duration, which is forbidden', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm2a = new SynthControlMessage({
      p: 'gain',
      d: -1.678678678678, // negative duration is invalid
      v: -0.567567567567,
    });
  });
  test('Negative durations not allowed', () => { expect(tf.scm2a.duration).toEqual(0); });
});


describe('Test SCM constructed with valid data, thorough test', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm3 = new SynthControlMessage({
      param: 'delay',
      duration: 4,
      start: 0.0345,
      end: 0.0678,
    });
  });
  // Full test of all the getters
  test('', () => { expect(tf.scm3.p).toEqual('delay'); });
  test('', () => { expect(tf.scm3.param).toEqual('delay'); });
  test('', () => { expect(tf.scm3.d).toEqual(4); });
  test('', () => { expect(tf.scm3.dur).toEqual(4); });
  test('', () => { expect(tf.scm3.duration).toEqual(4); });
  test('', () => { expect(tf.scm3.start).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.v).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.val).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.value).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.vS).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.valStart).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.valueStart).toEqual(0.0345); });
  test('', () => { expect(tf.scm3.end).toEqual(0.0678); });
  test('', () => { expect(tf.scm3.vE).toEqual(0.0678); });
  test('', () => { expect(tf.scm3.valEnd).toEqual(0.0678); });
  test('', () => { expect(tf.scm3.valueEnd).toEqual(0.0678); });
  test('', () => { expect(tf.scm3.toString()).toEqual("SynthControlMessage: param 'delay', duration 4, values 0.0345 to 0.0678"); });
  // Before timing set
  test('', () => { expect(tf.scm3.isTimeSet).toEqual(false); });
  test('', () => { expect(tf.scm3.timeStart).toEqual(0); });
  test('', () => { expect(tf.scm3.timeEnd).toEqual(4); });
  // After timing set
  test('', () => { expect(tf.scm3.setTimeStart(39)).toBe(tf.scm3); });
  test('', () => { expect(tf.scm3.setTimeStart(39).isTimeSet).toEqual(true); });
  test('', () => { expect(tf.scm3.setTimeStart(39).timeStart).toEqual(39); });
  test('', () => { expect(tf.scm3.setTimeStart(39).timeEnd).toEqual(43); });
  test('', () => { expect(tf.scm3.setTimeStart(39).toString()).toEqual("SynthControlMessage: param 'delay', time 39 to 43 (duration 4), values 0.0345 to 0.0678"); });
  // Timing edge case
  test('setTimeStart only accepts numbers', () => { expect(tf.scm3.setTimeStart('not a number').isTimeSet).toEqual(false); });
  // Test .map
  test('', () => {
    expect(tf.scm3.map(
      { type: 'value', op: '+', num: -0.0003 },
    ).toString()).toEqual("SynthControlMessage: param 'delay', duration 4, values 0.0342 to 0.0675");
  });
  test('', () => {
    expect(tf.scm3.map(
      { type: 'flip' },
    ).toString()).toEqual("SynthControlMessage: param 'delay', duration 4, values 0.0678 to 0.0345");
  });
  test('', () => {
    expect(tf.scm3.map(
      { type: 'flip', params: ['delay'] },
    ).toString()).toEqual("SynthControlMessage: param 'delay', duration 4, values 0.0678 to 0.0345");
  });
  test('', () => {
    expect(tf.scm3.map(
      { type: 'flip', params: ['freq'] },
    ).toString()).toEqual("SynthControlMessage: param 'delay', duration 4, values 0.0345 to 0.0678");
  });
});


describe('Test constructing SCM from another SCM (with no modification)', () => {
  const tf = {};
  beforeEach(() => {
    tf.scmPrev = new SynthControlMessage({
      param: 'freq',
      duration: 4,
      value: 440,
      badKey: 'badValue',
    });
    tf.scm4 = new SynthControlMessage(tf.scmPrev);
  });
  test('', () => { expect(tf.scm4).not.toBe(tf.scmPrev); });
  test('', () => { expect(tf.scm4.param).toEqual(tf.scmPrev.param); });
  test('', () => { expect(tf.scm4.duration).toEqual(tf.scmPrev.duration); });
  test('', () => { expect(tf.scm4.value).toEqual(tf.scmPrev.value); });
  test('', () => { expect(tf.scm4.valueEnd).toEqual(tf.scmPrev.valueEnd); });
});


describe('Test SCM constructed from another SCM, with some modification', () => {
  const tf = {};
  beforeEach(() => {
    tf.scmPrev = new SynthControlMessage({
      param: 'freq',
      duration: 4,
      value: 440,
      badKey: 'badValue',
    });
    tf.scm5 = new SynthControlMessage(tf.scmPrev, { start: 550, end: 660 });
  });
  test('', () => { expect(tf.scm5.value).toEqual(550); });
  test('', () => { expect(tf.scm5.valueEnd).toEqual(660); });
  test('', () => { expect(tf.scm5.isConstant).toBeFalsy(); });
});


describe('Test value start and end exhaustively when constructing from another SCM', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm1 = new SynthControlMessage({
      param: 'f1',
      duration: 4,
      value: 440,
    });
    tf.scm2 = new SynthControlMessage({
      param: 'f1',
      duration: 4,
      start: 550,
      end: 660,
    });
    tf.scm1v = new SynthControlMessage(tf.scm1, { value: 770 });
    tf.scm1se = new SynthControlMessage(tf.scm1, { start: 880, end: 990 });
    tf.scm2v = new SynthControlMessage(tf.scm2, { value: 991 });
    tf.scm2se = new SynthControlMessage(tf.scm2, { start: 992, end: 993 });
  });
  // scm1v
  test('', () => { expect(tf.scm1v.v).toEqual(770); });
  test('', () => { expect(tf.scm1v.vE).toEqual(770); });
  test('', () => { expect(tf.scm1v.isConstant).toBeTruthy(); });
  // scm1se
  test('', () => { expect(tf.scm1se.v).toEqual(880); });
  test('', () => { expect(tf.scm1se.vE).toEqual(990); });
  test('', () => { expect(tf.scm1se.isConstant).toBeFalsy(); });
  // scm2v
  test('', () => { expect(tf.scm2v.v).toEqual(991); });
  test('', () => { expect(tf.scm2v.vE).toEqual(991); });
  test('', () => { expect(tf.scm2v.isConstant).toBeTruthy(); });
  // scm2se
  test('', () => { expect(tf.scm2se.v).toEqual(992); });
  test('', () => { expect(tf.scm2se.vE).toEqual(993); });
  test('', () => { expect(tf.scm2se.isConstant).toBeFalsy(); });
});


describe('Test SCM with SAME start and end is constant', () => {
  const tf = {};
  beforeEach(() => {
    tf.scm6 = new SynthControlMessage({
      p: 'param', d: 1, s: 550, e: 550,
    });
  });
  test('', () => { expect(tf.scm6.isConstant).toBeTruthy(); });
});

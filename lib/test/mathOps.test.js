import mathOps from '../src/mathOps';

test('test addition', () => { expect(mathOps['+'](4, 5)).toEqual(9); });
test('test multiplication', () => { expect(mathOps['*'](4, 5)).toEqual(20); });
test('test exponentiation a^b', () => { expect(mathOps['^'](4, 5)).toEqual(1024); });
test('test exponentiation b^a', () => { expect(mathOps.exp(4, 5)).toEqual(625); });
test('test logarithms log_b(a)', () => { expect(mathOps.log(4, 2)).toEqual(2); });

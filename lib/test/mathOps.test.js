import mathOps from '../src/mathOps';

test('', () => { expect(mathOps['+'](4, 5)).toEqual(9); });
test('', () => { expect(mathOps['*'](4, 5)).toEqual(20); });
test('', () => { expect(mathOps['^'](4, 5)).toEqual(1024); });
test('', () => { expect(mathOps.exp(4, 5)).toEqual(625); });
test('', () => { expect(mathOps.log(4, 2)).toEqual(2); });

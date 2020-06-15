import { mathsOps, unaryOps } from '../src/mathsOperations';

test('test addition 4 + 5', () => { expect(mathsOps['+'](4, 5)).toEqual(9); });
test('test multiplication 4 * 5', () => { expect(mathsOps['*'](4, 5)).toEqual(20); });
test('test exponentiation 4 ** 5', () => { expect(mathsOps['^'](4, 5)).toEqual(1024); });
test('test exponentiation 5 ** 4 (order reverses)', () => { expect(mathsOps.exp(4, 5)).toEqual(625); });
test('test logarithms log_2(4)', () => { expect(mathsOps.log(4, 2)).toEqual(2); });
test('test subtraction 2 - 4 (order reverses)', () => { expect(mathsOps['-'](4, 2)).toEqual(2 - 4); });
test('test division 15 / 3 (order reverses)', () => { expect(mathsOps['/'](3, 15)).toEqual(15 / 3); });
test('test max of 8 and 5', () => { expect(mathsOps.max(8, 5)).toEqual(8); });
test('test min of 8 and 5', () => { expect(mathsOps.min(8, 5)).toEqual(5); });
test('test absolute value of -42 (only has 1 input)', () => { expect(mathsOps.abs(-42)).toEqual(42); });

test('test there is 1 unary op', () => { expect(Object.keys(unaryOps).length).toEqual(1); });
test('test abs is a unary op', () => { expect(Object.keys(unaryOps).includes('abs')).toBeTruthy(); });

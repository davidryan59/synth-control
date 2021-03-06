import displayNumber from '../src/displayNumber';

// Test fixtures, array of:
// [ Number of significant figures, input number, output string, optional string message ]
const tf = [
  // Small positive and negative integer cases
  [0, '0'],
  [-0, '0'],
  [1, '1'],
  [-1, '-1'],
  [3, '3'],
  [-5, '-5'],
  [23, '23'],
  [-987, '-987'],
  [3726, '3726'],
  [-3726, '-3726'],
  // Simple positive and negative integer cases, around target of 9 chars
  [12358706, '12358706'],
  [-12358706, '-12358706'],
  [867690452, '867690452'],
  [-867690452, '-8.677e+8'],
  [4979924075, '4.9799e+9'],
  [-4979924075, '-4.980e+9'],
  // Test a variety of decimals (1/23 = 0.04347826087) around 9 char limit
  [1000000000 / 23, '4.3478e+7'],
  [-1000000000 / 23, '-4.348e+7'],
  [100000000 / 23, '4347826.1'],
  [-100000000 / 23, '-4.348e+6'],
  [10000000 / 23, '434782.61'],
  [-10000000 / 23, '-434782.6'],
  [10000 / 23, '434.78261'],
  [-10000 / 23, '-434.7826'],
  [1 / 23, '0.0434783'],
  [-1 / 23, '-0.043478'],
  [1 / 230, '0.0043478'],
  [-1 / 230, '-0.004348'],
  [1 / 2300, '0.0004348'],
  [-1 / 2300, '-4.348e-4'],
  [1 / 23000, '4.3478e-5'],
  [-1 / 23000, '-4.348e-5'],
  // Test a variety of decimals (1/23 = 0.04347826087) around 9 char limit
  [0 + 0.5 + 678678678, '6.7868e+8'],
  [0 - 0.5 - 678678678, '-6.787e+8'],
  [0 + 0.5 + 67867867, '6.7868e+7'],
  [0 - 0.5 - 67867867, '-6.787e+7'],
  [0 + 0.5 + 6786786, '6786786.5'],
  [0 - 0.5 - 6786786, '-6.787e+6'],
  [0 + 0.5 + 678678, '678678.5'],
  [0 - 0.5 - 678678, '-678678.5'],
  [0 + 0.5 + 6786, '6786.5'],
  [0 - 0.5 - 6786, '-6786.5'],
  [0 + 0.5 + 67, '67.5'],
  [0 - 0.5 - 67, '-67.5'],
  [0 + 0.5 + 6, '6.5'],
  [0 - 0.5 - 6, '-6.5'],
  // Test small exact decimals
  [1 / 160, '0.00625'],
  [-1 / 160, '-0.00625'],
  [1 / 1600, '0.000625'],
  [-1 / 1600, '-6.250e-4'],
  [1 / 16000, '6.2500e-5'],
  [-1 / 16000, '-6.250e-5'],
  // Test carrying
  [9.999999, '9.999999'],
  [-9.999999, '-9.999999'],
  [9.9999999, '9.9999999'],
  [-9.9999999, '-10'],
  [9.999999999, '10'],
  [-9.999999999, '-10'],
  // Test very big and small
  [7.68578989e300, '7.69e+300'],
  [-7.68578989e300, '-7.7e+300'],
  [6.59759696e-300, '6.60e-300'],
  [-6.59759696e-300, '-6.6e-300'],
  // Test variable chars (integer)
  [42, '42', 3],
  [-42, '-42', 3],
  [42, '42', 6],
  [-42, '-42', 6],
  [42, '42', 12],
  [-42, '-42', 12],
  [8787, '8.8e+3', 3],
  [-8787, '-8.8e+3', 3],
  [8787, '8787', 6],
  [-8787, '-8787', 6],
  [8787, '8787', 12],
  [-8787, '-8787', 12],
  // Test variable chars (large decimal)
  [100000 / 23, '4.3e+3', 3],
  [-100000 / 23, '-4.3e+3', 3],
  [100000 / 23, '4.3e+3', 5],
  [-100000 / 23, '-4.3e+3', 5],
  [100000 / 23, '4347.8', 6],
  [-100000 / 23, '-4.3e+3', 6],
  [100000 / 23, '4347.83', 7],
  [-100000 / 23, '-4347.8', 7],
  [100000 / 23, '4347.826087', 12],
  [-100000 / 23, '-4347.826087', 12],
  [100000 / 23, '4347.8260869565', 15],
  [-100000 / 23, '-4347.826086957', 15],
  // Test variable chars (small decimal)
  [1 / 23000, '4.35e-5', 7],
  [-1 / 23000, '-4.3e-5', 7],
  [1 / 23000, '0.0000434783', 12],
  [-1 / 23000, '-0.000043478', 12],
  // Test edge cases
  ['not a number', 'not a number'],
  [0, '0', null],
  [0, '0', -200],
  [0, '0', 200],
];

tf.forEach(([input, expectedOutput, targetChars = 9]) => {
  const msg = `${input} with target chars ${targetChars} should give ${expectedOutput}`;
  test(msg, () => {
    const actualOutput = displayNumber(targetChars)(input);
    expect(actualOutput).toEqual(expectedOutput);
  });
});

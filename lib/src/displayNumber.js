// Format a number for display, with a target number of characters.
// Use exponential format only if integer or decimal
// would not result in enough accuracy.

// Parameter settings in the format [min, default, max]
const targetCharSettings = [3, 9, 15]; // target length of formatted number

const checkValueUsingSettings = (value, settings) => {
  const minValue = settings[0];
  const defaultValue = settings[1];
  const maxValue = settings[2];
  if (!Number.isFinite(value)) return defaultValue;
  if (value < minValue) return minValue;
  if (value > maxValue) return maxValue;
  return value;
};

// Use this for default result
const toString = (n) => `${n}`;

const displayNumber = (targetChars) => {
  const chars = checkValueUsingSettings(targetChars, targetCharSettings);
  return (n) => {
    // If n is not a finite number, return toString
    if (!Number.isFinite(n)) return toString(n);
    // Some helpful calcs here
    const nSign = Math.sign(n);
    const nSignChars = (nSign === -1) ? 1 : 0;
    const nAbs = Math.abs(n);
    const nSize = (nAbs === 0) ? 1 : 1 + Math.floor(Math.log10(nAbs));
    // If n is a small integer, return toString
    if (Number.isInteger(n) && nSize + nSignChars <= chars) return toString(n);
    // Set up function to get suitably formatted exponential
    const nFloat = Number.parseFloat(n);
    const getExponential = () => {
      // Test how long numeric string would be first, then adjust length.
      const testLenExp = nFloat.toExponential(chars).length;
      const finalDPsExp = Math.max(1, chars + (chars - testLenExp));
      return nFloat.toExponential(finalDPsExp);
    };
    // If nAbs is too large, use exponential format
    if (nSize + nSignChars + 2 > chars) return getExponential();
    // If nAbs is too small, use exponential format
    // Sum is lengths of: 1. negative sign, 2. '0.', 3. pos of 1st dp, 4. want three more sfs
    if (nAbs < 1 && nSignChars + 2 + (1 - nSize) + 3 > chars) return getExponential();
    // Otherwise, use fixed format. Test and adjust.
    const testLenFixed = nFloat.toFixed(chars).length;
    const finalDPsFixed = Math.max(1, chars + (chars - testLenFixed));
    let result = nFloat.toFixed(finalDPsFixed);
    // Tidy up two edge cases:
    // 1. Remove any trailing zeros after the decimal point
    /* istanbul ignore next */ 
    if (result.includes('.') && !(result.includes('e'))) {
      let i = result.length - 1;
      while (i > 0 && result[i] === '0') i -= 1;
      result = result.slice(0, i + 1);
    }
    // 2. If last character is a decimal point, remove it
    const len = result.length;
    if (result[len - 1] === '.') result = result.slice(0, len - 1);
    return result;
  };
};

export default displayNumber;

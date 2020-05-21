import isArray from 'isarray';
import isFunction from 'is-function';

const privateSet = (obj, key, arrayOfPotentialValues, functionToValidate) => {
  if (!isArray(arrayOfPotentialValues)) return;
  if (!isFunction(functionToValidate)) return;
  for (let i = 0; i < arrayOfPotentialValues.length; i += 1) {
    const val = arrayOfPotentialValues[i];
    if (functionToValidate(val)) {
      obj[key] = val; /* eslint-disable-line no-param-reassign */
      return;
    }
  }
};

export default privateSet;

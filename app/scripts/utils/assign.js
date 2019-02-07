import { isNull, isUndefined } from '../libs/get-type-of';

export const assign = target => {
  if (isNull(target) || isUndefined(target)) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  const output = Object(target);
  for (let i = 1; i < arguments.length; i++) {
    const source = arguments[i];
    if (!isNull(source) && !isUndefined(source)) {
      for (const nextKey in source) {
        if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
  }
  return output;
};

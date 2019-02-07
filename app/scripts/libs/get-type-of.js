/**
 * 文字列かどうか返す
 * @param str
 * @return {boolean}
 */
export const isString = str => {
  return typeof str === 'string' ? true : false;
};

export const isUndefined = value => typeof value === 'undefined';
export const isNull = value => value === null;
export const isArray = value => Array.isArray(value);
export const isFunction = func => typeof func === 'function';
export const isObject = obj => obj === Object(obj);

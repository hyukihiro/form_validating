import { isNull, isArray } from './get-type-of';

const _regHistory = {};

// ---------------------------------------------------------
// private func
// ---------------------------------------------------------
const _regClassName = className => {
  if (_regHistory[className]) {
    return _regHistory[className];
  }
  const reg = new RegExp(`(^|\\s+)${className}(\\s+|$)`);
  _regHistory[className] = reg;
  return reg;
};

const _trim = str => str.replace(/^\s+|\s+$/g, '');

// ---------------------------------------------------------
// public func
// ---------------------------------------------------------
export const hasClass = (element, className) => {
  const defaultClassName = element.className;
  if (!defaultClassName || defaultClassName.length === 0) {
    return false;
  } else if (defaultClassName === className) {
    return true;
  }
  return _regClassName(className).test(defaultClassName);
};

export const addClass = (element, className) => {
  if (isNull(element)) {
    return;
  }

  const defaultClassName = element.className;
  if (!hasClass(element, className)) {
    element.className += (defaultClassName ? ' ' : '') + className;
  }
};

export const removeClass = (element, className, _except) => {
  if (isNull(element)) {
    return;
  }
  const defaultClassName = element.className;
  let newClassName = '';
  if (_except || hasClass(element, className)) {
    newClassName = _trim(defaultClassName.replace(_regClassName(className), ' '));
    element.className = newClassName;
  }
};

export const removeClasses = (element, classNames) => {
  if (!isArray(classNames)) {
    return;
  }
  classNames.forEach(c => removeClass(element, c));
};

export const attr = (element, key) => element.getAttribute(key);

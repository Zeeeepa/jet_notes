const {isNumeric} = require('./numeric');
const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');
const isFunction = require('lodash/isFunction');

const isPureObject = (value) => {
  return isObject(value) && !isArray(value) && !isFunction(value);
};

const isDataObject = (value) => {
  return isObject(value) && !isFunction(value);
};

const isNonNumericFalsy = (value) => {
  return !isNumeric(value) && !value;
};

const isRegex = (value) => value instanceof RegExp;

module.exports = {
  isDataObject,
  isNonNumericFalsy,
  isPureObject,
  isRegex,
};

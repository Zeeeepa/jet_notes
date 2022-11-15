const isNil = require('lodash/isNil');
const isBoolean = require('lodash/isBoolean');

const isNumeric = (num) => {
  return !isNil(num) && !isNaN(num) && !isBoolean(num) && num !== '';
};

const roundOff = (number, decimalPlaces = 2) => {
  const floatNumber = parseFloat(number);

  return parseFloat(floatNumber.toFixed(decimalPlaces));
};

const average = (...numbers) => {
  const sum = numbers.reduce((a, b) => a + b, 0);
  const avg = sum / numbers.length || 0;

  return avg;
};

const zeroPad = (number) => {
  const text = '0' + number;
  const offset = text.length > 3 ? text.length - 3 : 0;
  const result = text.slice(-2 - offset);

  return result;
};

module.exports = {
  isNumeric,
  roundOff,
  average,
  zeroPad,
};

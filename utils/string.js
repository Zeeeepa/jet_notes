const isObject = require("lodash/isObject");
const isNil = require("lodash/isNil");
const uniq = require("lodash/uniq");
const RegexBuilder = require("./RegexBuilder");
const { isRegex } = require("./value");

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const uncapitalizeFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

const replace = (text, stringOrRegex, replaceWith = "") => {
  return text.replace(stringOrRegex, replaceWith);
};

const replaceAll = (text, stringOrRegex, replaceWith = "") => {
  return text.replaceAll(stringOrRegex, replaceWith);
};

const replaceStrings = (text, stringsToReplaceMapping = {}) => {
  const updatedText = Object.entries(stringsToReplaceMapping).reduce(
    (acc, [word, newWord]) => replaceAll(acc, word, newWord),
    text
  );

  return updatedText;
};

const replaceWords = (text, stringsToReplaceMapping = {}, flags = "g") => {
  const updatedText = Object.entries(stringsToReplaceMapping).reduce(
    (acc, [word, newWord]) => {
      const regexp = RegexBuilder.generateRegex(
        {
          start: "\\b",
          end: "\\b",
          between: word,
        },
        flags
      );

      return replaceAll(acc, regexp, newWord);
    },
    text
  );

  return updatedText;
};

const getMatches = (text = "", regexStringOrOptions, flags = "g") => {
  let regex;

  if (isRegex(regexStringOrOptions)) {
    regex = regexStringOrOptions;
  } else {
    regex = RegexBuilder.generateRegex(regexStringOrOptions, flags);
  }

  const matches = text.match(regex);

  return matches;
};

function parseJson(text, defaultValue) {
  try {
    const jsonResponse = JSON.parse(text);

    return jsonResponse;
  } catch (err) {
    if (!isNil(defaultValue)) {
      return defaultValue;
    } else if (isObject(text)) {
      return text;
    }

    throw err;
  }
}

const getStartString = (text = "", delimiter) => {
  if (!delimiter) {
    throw `Missing "delimiter" is required`;
  }

  return text.split(delimiter)[0];
};

const getEndString = (text = "", delimiter = "") => {
  if (!delimiter) {
    throw `Missing "delimiter" is required`;
  }

  return text.split(delimiter).pop();
};

const trimStartString = (textArg, strLength = 0) => {
  const text = textArg || "";

  return text.slice(strLength);
};

const trimEndString = (textArg, strLength = 0) => {
  const text = textArg || "";

  return text.slice(0, text.length - strLength);
};

const capitalizedCharsRegex = /[A-Z]*[A-Z]/g;

const transformString = (str, delimiterArg, text) => {
  const isFirst = text.startsWith(str);
  const delimiter = delimiterArg || "";
  const isCamelCase = !delimiter;

  let transformedStr = `${delimiter}${
    isFirst || !isCamelCase ? str.toLowerCase() : str.toUpperCase()
  }`;

  if (str.length > 1) {
    let prevStr = trimEndString(str, 1);
    const currStr = trimStartString(str, prevStr.length);

    transformedStr =
      `${delimiter}${
        isFirst || !isCamelCase ? prevStr.toLowerCase() : prevStr.toUpperCase()
      }` +
      `${delimiter}${
        !isCamelCase ? currStr.toLowerCase() : currStr.toUpperCase()
      }`;
  }

  return transformedStr;
};

const startsWithDelimeter = (str, delimiter) =>
  !!delimiter && str.startsWith(delimiter);

const transformStringFormat = (text, delimiter) => {
  const matches = getMatches(text, capitalizedCharsRegex);

  const transformedString = uniq(matches).reduce((accStr, str) => {
    const transformedStr = transformString(str, delimiter, accStr);

    return replaceAll(accStr, str, transformedStr);
  }, text);

  return startsWithDelimeter(transformedString, delimiter)
    ? trimStartString(transformedString, delimiter.length)
    : transformedString;
};

const camelToSnakeCase = (text) => transformStringFormat(text, "_");

const camelToKebabCase = (text) => transformStringFormat(text, "-");

const toCamelCase = (text) => transformStringFormat(text, "");

const translateCaseSensitive = (text, stringToReplace, newString) =>
  text.replace(new RegExp(stringToReplace, "g"), function () {
    return newString;
  });

const trimLines = (str = "") => {
  const text = str.trim();
  const stringOrRegexToReplace = /\n\s+/g;
  const replaceWith = "\n";

  return replace(text, stringOrRegexToReplace, replaceWith);
};

module.exports = {
  capitalizeFirstLetter,
  uncapitalizeFirstLetter,
  replace,
  replaceAll,
  replaceStrings,
  replaceWords,
  parseJson,
  getMatches,
  getStartString,
  getEndString,
  trimStartString,
  trimEndString,
  capitalizedCharsRegex,
  transformStringFormat,
  camelToSnakeCase,
  camelToKebabCase,
  toCamelCase,
  translateCaseSensitive,
  trimLines,
};

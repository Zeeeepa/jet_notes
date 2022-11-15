const { getMatches, trimLines } = require("./string");

const arrowFunctionRegex =
  /^(?:async)?\s*(?:function\s*\*?\s*|\(*(.*?)\)*\s*=>\s*\{([\s\S]*)\})$/;
const normalFunctionRegex =
  /^(?:async)?\s*(?:function\s*\*?\s*|(\w+)\s*=>\s*)\s*\((.*?)\)\s*\{([\s\S]*)\}$/;

const evalTemplate = (template, args) =>
  new Function(...args, "return `" + template.replace(/`/g, "\\`") + "`");

const getFunctionString = (fn) => {
  const fnString = fn.toString();
  const arrowFunctionMatch = getMatches(fnString, arrowFunctionRegex);
  const normalFunctionMatch = getMatches(fnString, normalFunctionRegex);
  const match = arrowFunctionMatch || normalFunctionMatch;

  if (match) {
    let params, body;

    if (arrowFunctionMatch) {
      params = match[1];
      body = match[2];
    } else {
      params = match[2];
      body = match[3];
    }

    const trimmedBody = body.trim().replace(/\n/g, "\n  ");

    const trimmedResult = trimLines(`(${params}) => {\n  ${trimmedBody}\n}`);

    return trimmedResult;
  } else {
    throw new Error("Invalid function");
  }
};

const getFunctionBody = (fn) => {
  const fnString = fn.toString();
  const arrowFunctionMatch = getMatches(fnString, arrowFunctionRegex);
  const normalFunctionMatch = getMatches(fnString, normalFunctionRegex);
  const match = arrowFunctionMatch || normalFunctionMatch;

  if (match) {
    let body;

    if (arrowFunctionMatch) {
      body = match[2];
    } else {
      body = match[3];
    }
    const trimmedResult = trimLines(body);

    return trimmedResult;
  } else {
    throw new Error("Invalid function");
  }
};

module.exports = {
  evalTemplate,
  getFunctionString,
  getFunctionBody,
};

import { isArray, isEmpty, isObject } from "lodash";
import { replaceProperties } from "../../../../utils/object";

export const convertObject = (objMapping) => {
  if (isEmpty(objMapping)) {
    return isArray(objMapping) ? "[]" : "{}";
  }

  const transformedValuesStr = Object.entries(objMapping)
    .map(([key, value]) => {
      let transformedValue;

      if (isArray(value)) {
        transformedValue = `[${value
          .map((item) => convertObject(item))
          .join(",")}]`;
      } else {
        transformedValue = isObject(value)
          ? convertObject(value)
          : `'${value}'`;
      }

      return `'${key}': ${transformedValue}`;
    })
    .join(",");

  return `{
    ${transformedValuesStr}
  }`;
};

export const convertObjectToString = (objMapping, paramKey) => {
  const transformedValues = Object.entries(objMapping).reduce(
    (acc, [key, value]) => {
      const accArr = [...acc];

      accArr.push(`${key}: ${paramKey}.${value}`);

      return accArr;
    },
    []
  );

  return `{
    ${transformedValues.join(",")}
  }`;
};

export const convertImports = (objMapping = {}) => {
  const transformedValues = Object.entries(objMapping).reduce(
    (acc, [path, value]) => {
      const accArr = [...acc];
      const { default: defaultIdentifier, identifiers } = value;

      let imports = [];

      if (defaultIdentifier) {
        imports.push(defaultIdentifier);
      }

      if (identifiers?.length) {
        const identifiersStr = `{${identifiers.join(",")}}`;
        imports = imports.concat(identifiersStr);
      }

      if (imports.length) {
        const importsStr = imports.join(",");

        const importStr = `const ${importsStr} = require("${path}");`;

        accArr.push(importStr);
      }

      return accArr;
    },
    []
  );

  return transformedValues.join("\n");
};

export const prependNotation = (objMapping, paramKey) => {
  const valueCallback = (val) => `${paramKey}.${val}`;

  const transformedValues = replaceProperties(objMapping, null, valueCallback);

  return transformedValues;
};

export const wrapValuesWithRequire = (objMapping) => {
  const valueCallback = (val) => `require("${val}")`;

  const transformedValues = replaceProperties(objMapping, null, valueCallback);

  return transformedValues;
};

export const wrapValuesWithText = (arr, { start, end }) => {
  const transformedValues = arr.reduce((acc, text) => {
    const accObj = { ...acc };

    accObj[text] = `${start}${text}${end}`;

    return accObj;
  }, {});

  return transformedValues;
};

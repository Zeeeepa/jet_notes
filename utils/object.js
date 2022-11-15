const isString = require("lodash/isString");
const isNil = require("lodash/isNil");
const isUndefined = require("lodash/isUndefined");
const isArray = require("lodash/isArray");
const isFunction = require("lodash/isFunction");
const isEqual = require("lodash/isEqual");
const isEmpty = require("lodash/isEmpty");
const get = require("lodash/get");
const difference = require("lodash/difference");
const lodashMerge = require("lodash/merge");
const lodashMatches = require("lodash/matches");
const { isNonNumericFalsy, isDataObject, isPureObject } = require("./value");
const { findItem, sortArrayByPriority, uniqByKeys } = require("./array");
const { runPromisesGenerator } = require("./promise");

const merge = (obj1, obj2) => ({ ...lodashMerge(obj1, obj2) });

const toArray = (value) => (!value ? [] : isArray(value) ? value : [value]);

const contains = (arrOrObj, arrOrObjSubSet) => {
  if (isDataObject(arrOrObjSubSet) && !isEmpty(arrOrObjSubSet)) {
    if (isArray(arrOrObj)) {
      const diffArr = difference(arrOrObjSubSet, arrOrObj);

      return diffArr.length !== arrOrObjSubSet.length;
    }

    return lodashMatches(arrOrObjSubSet)(arrOrObj);
  }

  return false;
};

const containsAll = (arr = [], subset = []) => {
  return !!subset?.length && difference(subset, arr).length === 0;
};

const includesFirst = (arr = [], subset = []) => {
  if (!subset?.length) {
    return false;
  }

  const firstItems = arr.slice(0, subset.length);

  return isEqual(firstItems, subset);
};

const includesLast = (arr = [], subset = []) => {
  if (!subset?.length) {
    return false;
  }

  const lastItems = arr.slice(-subset.length);

  return isEqual(lastItems, subset);
};

const parseObj = (obj) => {
  return {
    ...obj,
    hasProperty: (prop) => obj.hasOwnProperty(prop),
    hasPropertyTruthy: (prop) => obj.hasOwnProperty(prop) && obj[prop],
  };
};

const callTraverseProperties = ({
  value: objArg,
  conditionCallback,
  valueCallback,
  keyMapping,
  keys = ["root"],
  absoluteKeys = [keys[0]],
  level = 0,
  root = objArg,
  shouldRemove,
}) => {
  const valueIsArray = isArray(objArg);

  let obj = Object.assign({}, objArg);

  if (
    level === 0 &&
    isPureObject(objArg) &&
    isFunction(conditionCallback) &&
    isFunction(valueCallback)
  ) {
    const rootArgs = {
      key: null,
      reference: null,
      keyPaths: keys,
      absoluteKeyPaths: absoluteKeys,
      absolutePath: absoluteKeys.join("."),
      level,
    };

    const conditionPassed = conditionCallback(obj, rootArgs);

    if (conditionPassed) {
      obj = valueCallback(obj, rootArgs);
    }
  }

  if (!valueIsArray && keyMapping) {
    obj = Object.keys(obj).reduce((acc, key) => {
      const accObj = { ...acc };

      const mappedKey = keyMapping[key] || key;
      const value = obj[key];

      accObj[mappedKey] = value;

      return accObj;
    }, {});
  }

  let entries = Object.entries(obj);

  let traversedData = entries.reduce(
    (acc, [key, value]) => {
      const absoluteKeyPaths = absoluteKeys.concat(key);
      const keyPaths = !valueIsArray ? keys.concat(key) : keys;
      const accObj = { ...acc };

      const conditionPassed =
        !conditionCallback ||
        conditionCallback(value, {
          key,
          reference: objArg,
          keyPaths,
          absoluteKeyPaths,
          absolutePath: absoluteKeyPaths.join("."),
          level,
        });

      if (!isDataObject(value)) {
        if (conditionPassed) {
          if (shouldRemove) {
            accObj[key] = value;
          } else {
            const derivedValue = valueCallback?.(value, {
              key,
              reference: objArg,
              keyPaths,
              absoluteKeyPaths,
              absolutePath: absoluteKeyPaths.join("."),
              level,
            });

            accObj[key] = !isUndefined(derivedValue) ? derivedValue : value;
          }
        }
      } else {
        let derivedValue = value;

        if (!shouldRemove || conditionPassed) {
          if (conditionPassed && conditionCallback && valueCallback) {
            derivedValue = valueCallback?.(value, {
              key,
              reference: objArg,
              keyPaths,
              absoluteKeyPaths,
              absolutePath: absoluteKeyPaths.join("."),
              level,
            });
          }

          accObj[key] = callTraverseProperties({
            value: derivedValue,
            conditionCallback,
            valueCallback,
            keyMapping,
            keys: keyPaths,
            absoluteKeys: absoluteKeyPaths,
            level: absoluteKeyPaths.length - 1,
            root,
            shouldRemove,
          });
        }
      }

      return accObj;
    },
    shouldRemove ? {} : obj
  );

  if (valueIsArray) {
    traversedData = Object.values(traversedData);
  }

  return traversedData;
};

const traverseProperties = ({ ...args }) => {
  return callTraverseProperties({ ...args });
};

const readProperties = (value, conditionalValueOrFunc, keyToCompare) => {
  let propertiesArr = [];

  const valueCallback = (...args) => {
    return isFunction(conditionalValueOrFunc)
      ? conditionalValueOrFunc(...args)
      : conditionalValueOrFunc;
  };

  const conditionCallback = (val, { key, reference }) => {
    const passed =
      (!keyToCompare || keyToCompare === key) && isEqual(val, valueCallback());

    if (passed) {
      propertiesArr.push(keyToCompare ? reference : { key, reference });
    }

    return passed;
  };

  traverseProperties({ value, conditionCallback, valueCallback });

  return propertiesArr;
};

const readKeys = (
  value,
  conditionCallbackOrKeysArg,
  transformCallbackOrKeysArg,
  transformCallbackArg
) => {
  let keys = isArray(conditionCallbackOrKeysArg)
    ? conditionCallbackOrKeysArg
    : transformCallbackOrKeysArg;
  keys = !isArray(keys) ? [keys] : keys;
  let transformCallback =
    transformCallbackArg ||
    (isFunction(transformCallbackOrKeysArg)
      ? transformCallbackOrKeysArg
      : null);
  const isStringKeys = !!keys.length && isString(keys[0]);
  const valuesArr = [];

  const conditionCallback = (val, { key, reference, keyPaths }) => {
    let passed = false;

    if (isFunction(conditionCallbackOrKeysArg)) {
      passed = isPureObject(conditionCallbackOrKeysArg)
        ? contains(val, conditionCallbackOrKeysArg)
        : conditionCallbackOrKeysArg(val, { key, reference });

      if (passed) {
        if (isStringKeys) {
          keys.forEach((k) => {
            if (val.hasOwnProperty(k)) {
              valuesArr.push({
                key: k,
                val: !transformCallback
                  ? val[k]
                  : transformCallback(val[k], { key: k, reference: val }),
              });
            }
          });
        } else {
          valuesArr.push(
            !transformCallback
              ? { key, val }
              : { key, val: transformCallback(val, { key, reference }) }
          );
        }
      }
    } else {
      const keyNotation = findItem(keys, (k) =>
        includesLast(keyPaths, k.split("."))
      );

      passed = keys.includes(key) || !!keyNotation;

      if (passed) {
        const sortKey = keys.includes(key) ? key : keyNotation;

        valuesArr.push(
          !transformCallback
            ? { key: sortKey, val }
            : { key: sortKey, val: transformCallback(val, { key, reference }) }
        );
      }
    }

    return passed;
  };

  traverseProperties({
    value,
    conditionCallback,
    ...(isStringKeys && {
      allowedKeyPaths: keys,
    }),
  });

  const sortedValues = sortArrayByPriority(
    uniqByKeys(valuesArr, ["val"]),
    "key",
    keys
  );

  return sortedValues.map(({ val }) => val);
};

const replaceKeys = (value, keyMapping, valueOrFunc) => {
  const valueCallback = (...args) => {
    return isFunction(valueOrFunc) ? valueOrFunc(...args) : valueOrFunc;
  };

  return traverseProperties({
    value,
    keyMapping,
    valueCallback,
  });
};

const readObjects = (value, conditionCallback, keys = []) => {
  const valueArr = toArray(value);
  const objectsArr =
    valueArr.reduce?.((acc, item) => {
      let accArr = [...acc];

      if (conditionCallback(item)) {
        accArr.push(item);
      } else {
        keys.forEach((keyPath) => {
          accArr = accArr.concat(
            readObjects(get(item, keyPath), conditionCallback)
          );
        });
      }

      return accArr;
    }, []) || [];

  return objectsArr;
};

const readObjectProperties = (valueArg, keyMappingWithTransformArg) => {
  if (!valueArg || !keyMappingWithTransformArg) {
    return {};
  }

  const value = toArray(valueArg);
  const keyMappingWithTransform = toArray(keyMappingWithTransformArg);

  const keys = keyMappingWithTransform.reduce((acc, item) => {
    const accArr = [...acc];

    Object.keys(item).forEach((k) => {
      if (k !== "transform") {
        accArr.push(k);
      }
    });

    return accArr;
  }, []);
  const keysWithTransform = keyMappingWithTransform.reduce((acc, item) => {
    const accObj = { ...acc };

    Object.keys(item).forEach((k) => {
      if (k !== "transform") {
        const transformFunc = (val, args) => {
          return item.transform?.(val, args) || val;
        };
        const conditionFunc = (val, args) => {
          return item.condition ? item.condition(val, args) : true;
        };

        accObj[`${k}-${item[k]}-transform`] = transformFunc;
        accObj[`${k}-${item[k]}-condition`] = conditionFunc;
      }
    });

    return accObj;
  }, {});
  const valuesArr = [];

  const conditionCallback = (val, { key, keyPaths, ...args }) => {
    if (isPureObject(val)) {
      const keyNotation = findItem(keys, (k) => {
        const kArr = k.split(".");

        return (
          val.hasOwnProperty?.(k) ||
          includesLast(keyPaths, kArr.slice(0, kArr.length - 1))
        );
      });

      const passed = keys.includes(key) || !!keyNotation;

      if (passed) {
        const sortKey = keys.includes(key) ? key : keyNotation;
        const kVal = val[sortKey.split(".").pop()];
        const keyTransform = keysWithTransform[`${sortKey}-${kVal}-transform`];
        const keyCondition = keysWithTransform[`${sortKey}-${kVal}-condition`];

        if (keyTransform && keyCondition(val, { key, keyPaths, ...args })) {
          valuesArr.push({
            key: sortKey,
            val: keyTransform(val, { key, keyPaths, ...args }),
          });
        }
      }
    }
  };

  traverseProperties({ value, conditionCallback });

  const sortedValues = sortArrayByPriority(
    uniqByKeys(valuesArr, ["val"]),
    "key",
    keys
  );

  return sortedValues.map(({ val }) => val);
};

const mergeObjectProperties = (
  value,
  conditionCallbackOrKeyMapping,
  valueOrFunc
) => {
  const conditionCallback = !conditionCallbackOrKeyMapping
    ? null
    : (val, { key, reference }) => {
        if (isPureObject(val)) {
          return isPureObject(conditionCallbackOrKeyMapping)
            ? contains(val, conditionCallbackOrKeyMapping)
            : conditionCallbackOrKeyMapping(val, { key, reference });
        }

        return false;
      };

  const valueCallback = (val, { key, reference }) => {
    if (isPureObject(valueOrFunc) && isPureObject(val)) {
      return merge(val, valueOrFunc);
    }

    return isFunction(valueOrFunc)
      ? valueOrFunc(val, { key, reference })
      : valueOrFunc;
  };

  return traverseProperties({
    value,
    conditionCallback,
    valueCallback,
  });
};

const replaceProperties = (value, conditionCallback, valueOrFunc) => {
  const valueCallback = (...args) => {
    return isFunction(valueOrFunc) ? valueOrFunc(...args) : valueOrFunc;
  };

  return traverseProperties({
    value,
    conditionCallback,
    valueCallback,
  });
};

const asyncReplaceProperties = async (
  value,
  conditionCallback,
  asyncValueCallback
) => {
  const promiseKeys = [];
  const promises = [];

  replaceProperties(value, conditionCallback, async (val, { key, ...args }) => {
    const promise = asyncValueCallback(val, { key, ...args });

    promiseKeys.push({ key, value: val });
    promises.push(promise);

    return promise;
  });
  const promiseResults = await runPromisesGenerator(promises);
  const keyMapping = promiseResults.reduce(
    (acc, val, index) => ({
      ...acc,
      [`${promiseKeys[index].key}-${promiseKeys[index].value}`]: {
        key: promiseKeys[index].key,
        oldValue: promiseKeys[index].value,
        newValue: val,
      },
    }),
    {}
  );

  return replaceProperties(
    value,
    (val, { key }) => {
      const k = `${key}-${val}`;

      return (
        keyMapping.hasOwnProperty(k) &&
        keyMapping[k].key === key &&
        keyMapping[k].oldValue === val
      );
    },

    (val, { key }) => {
      const k = `${key}-${val}`;

      return keyMapping[k].newValue;
    }
  );
};

const removeProperties = (value, conditionCallbackArg) => {
  const conditionCallback = (...args) => !conditionCallbackArg(...args);

  return traverseProperties({ value, conditionCallback, shouldRemove: true });
};

const removeNilValues = (value) => removeProperties(value, isNil);

const removeUndefinedValues = (value) => removeProperties(value, isUndefined);

const removeEmptyValues = (value) => removeProperties(value, isNonNumericFalsy);

const removeFunctions = (value) => removeProperties(value, isFunction);

module.exports = {
  merge,
  toArray,
  contains,
  containsAll,
  includesFirst,
  includesLast,
  parseObj,
  callTraverseProperties,
  traverseProperties,
  readKeys,
  replaceKeys,
  readObjects,
  readObjectProperties,
  mergeObjectProperties,
  readProperties,
  replaceProperties,
  asyncReplaceProperties,
  removeProperties,
  removeNilValues,
  removeUndefinedValues,
  removeEmptyValues,
  removeFunctions,
};

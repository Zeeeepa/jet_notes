const get = require("lodash/get");
const set = require("lodash/set");
const uniq = require("lodash/uniq");
const isObject = require("lodash/isObject");
const isArray = require("lodash/isArray");
const isString = require("lodash/isString");
const isNumber = require("lodash/isNumber");
const isNaN = require("lodash/isNaN");
const pick = require("lodash/pick");
const find = require("lodash/find");
const findIndex = require("lodash/findIndex");
const lodashEvery = require("lodash/every");
const lodashSome = require("lodash/some");
const filter = require("lodash/filter");
const uniqWith = require("lodash/uniqWith");
const unionWith = require("lodash/unionWith");
const mergeWith = require("lodash/mergeWith");
const lodashGroupBy = require("lodash/groupBy");
const { removeUndefinedValues } = require("./object");

const getLastItem = (arr = []) => arr.slice(-1)[0];

const findItem = (arr, keyValueMappingOrCallback) =>
  find(arr, keyValueMappingOrCallback);

const findItemIndex = (arr, keyValueMappingOrCallback) =>
  findIndex(arr, keyValueMappingOrCallback);

const filterItems = (arr, keyValueMappingOrCallback) =>
  filter(arr, keyValueMappingOrCallback);

const every = (arrArg, keyValueMappingOrCallback) => {
  const arr = arrArg || [];

  if (isObject(keyValueMappingOrCallback)) {
    return lodashEvery(arr, keyValueMappingOrCallback);
  }

  return arr.every((item) => item === keyValueMappingOrCallback);
};

const some = (arrArg, keyValueMappingOrCallback) => {
  const arr = arrArg || [];

  if (isObject(keyValueMappingOrCallback)) {
    return lodashSome(arr, keyValueMappingOrCallback);
  }

  return arr.some((item) => item === keyValueMappingOrCallback);
};

const hasDuplicates = (arr, key) => {
  const acc = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const value = !key ? item : item[key];

    if (acc.includes(value)) {
      return true;
    }

    acc.push(value);
  }

  return false;
};

const splice = (arr = [], ...args) => {
  const currentItems = arr.slice();
  const removedItems = currentItems.splice(...args);

  return { currentItems, removedItems, isLastItem: currentItems.length === 0 };
};

const compareObjectByValue =
  (key, sortBy = "asc") =>
  (item1, item2) => {
    const item1DerivedVal = key ? get(item1, key) : item1;
    const item2DerivedVal = key ? get(item2, key) : item2;
    const item1Val = !isNumber(item1DerivedVal)
      ? String(item1DerivedVal).toLowerCase()
      : item1DerivedVal;
    const item2Val = !isNumber(item2DerivedVal)
      ? String(item2DerivedVal).toLowerCase()
      : item2DerivedVal;
    const ascIndex = sortBy === "desc" ? -1 : 1;

    if (item1Val < item2Val) {
      return -ascIndex;
    }
    if (item1Val > item2Val) {
      return ascIndex;
    }
    return 0;
  };

const compareObjectByPriority =
  (key, priority = []) =>
  (item1, item2) => {
    const item1Val = key ? get(item1, key) : item1;
    const item2Val = key ? get(item2, key) : item2;

    const item1PriorityIndex = priority.indexOf(item1Val);
    const item2PriorityIndex = priority.indexOf(item2Val);

    if (item1PriorityIndex !== -1) {
      if (item2PriorityIndex !== -1) {
        if (item1PriorityIndex > item2PriorityIndex) {
          return 1;
        } else if (item2PriorityIndex === item1PriorityIndex) {
          return 0;
        }
      }

      return -1;
    }

    return 0;
  };

const compareObjectByCondition = (key, conditionCallback) => (item1, item2) => {
  const item1Value = !key
    ? item1
    : isArray(key)
    ? pick(item1, key)
    : item1[key];
  const item2Value = !key
    ? item2
    : isArray(key)
    ? pick(item2, key)
    : item2[key];

  const item1Succeeds = conditionCallback(item1Value);
  const item2Succeeds = conditionCallback(item2Value);

  if (item1Succeeds < item2Succeeds) {
    return 1;
  }
  if (item1Succeeds > item2Succeeds) {
    return -1;
  }

  return 0;
};

const compareObjectByGroups = (keys) => (item1, item2) => {
  return keys.reduce((acc, key) => {
    const item1Val = get(item1, key) || "";
    const item2Val = get(item2, key) || "";
    let sortIndex = 0;

    if (isNumber(item1Val) && !isNaN(Number(item1Val))) {
      sortIndex = item1Val - item2Val;
    } else {
      sortIndex = item1Val.localeCompare(item2Val);
    }

    return acc || sortIndex;
  }, 0);
};

const sortArray = (arr = [], sortDirection) => {
  return arr.slice().sort(compareObjectByValue(null, sortDirection));
};

const sortArrayByObjectKey = (arr = [], key, sortDirection) => {
  return arr.slice().sort(compareObjectByValue(key, sortDirection));
};

const sortArrayByPriority = (arr = [], key, priorityArg = [], priorityKey) => {
  const priority = isString(priorityArg) ? [priorityArg] : priorityArg;
  let finalPriority = priority;

  if (key) {
    const finalPriorityKey = priorityKey || key;

    finalPriority = priority.map((p) =>
      isObject(p) ? p[finalPriorityKey] : p
    );
  }

  return arr.slice().sort(compareObjectByPriority(key, finalPriority));
};

const sortArrayByKeyCondition = (arr = [], key, conditionCallback) => {
  return arr.slice().sort(compareObjectByCondition(key, conditionCallback));
};

const sortArrayByKeyValues = (arr = [], key, arrValues = []) => {
  const sortedArray = [];

  arrValues.forEach((value) => {
    const arrObj = arr.find((a) => a[key] === value);

    if (arrObj) {
      sortedArray.push(arrObj);
    }
  });

  return sortedArray;
};

const sortArrayByKeyValuesIncludeAll = (arr = [], key, arrValues = []) => {
  const sortedArray = [];

  arrValues.forEach((value) => {
    const arrObj = arr.find((a) => a[key] === value);

    if (arrObj) {
      sortedArray.push(arrObj);
    }
  });

  const nonExistingObjectsArray = arr.filter(
    (obj) => !sortedArray.some((sObj) => sObj[key] === obj[key])
  );

  return sortedArray.concat(nonExistingObjectsArray);
};

const sortArrayByObjectGroups = (arr = [], keys = []) => {
  return arr.slice().sort(compareObjectByGroups(keys));
};

const groupByKey = (arr = [], key) => {
  const groupedMapByKey = lodashGroupBy(arr, key);

  const result = Object.keys(groupedMapByKey).map((groupedKey) => {
    const groupedValue = groupedMapByKey[groupedKey];

    return {
      [key]: groupedKey,
      items: groupedValue,
    };
  });

  return result;
};

const groupByKeys = (arr = [], origKeysArr) => {
  let groupedArr = [],
    keysArr = origKeysArr;

  for (let index = 0; index < keysArr.length; index++) {
    const {
      currentItems: currentKeys,
      removedItems: removedKeys,
      isLastItem,
    } = splice(keysArr, 0, 1);
    const currentKey = removedKeys[0];

    groupedArr = groupByKey(arr, currentKey);

    if (!isLastItem) {
      groupedArr = groupedArr.map((groupedItem) => {
        return {
          ...groupedItem,
          items: groupByKeys(groupedItem.items, currentKeys),
        };
      });
    }
  }

  return groupedArr;
};

const groupBy = (arr = [], keys) => {
  if (!keys) {
    throw 'func(groupBy): "keys" are required';
  }

  const keysArr = isString(keys) ? [keys] : keys;

  return groupByKeys(arr, keysArr);
};

const convertPropertiesToArray = (obj, options) => {
  const { labelKey, valueKey, omitKeys } = Object.assign(
    { labelKey: "key", valueKey: "value", omitKeys: [] },
    options
  );
  const tempObj = { ...obj };

  omitKeys.forEach((key) => {
    delete tempObj[key];
  });

  const entries = Object.entries(tempObj);
  const arr = entries.map(([key, value]) => ({
    [labelKey]: key,
    [valueKey]: value,
  }));

  return arr;
};

const convertArrayToObject = (arr, defaultObj) => {
  let newObj = { ...defaultObj };

  arr.forEach((item) => {
    const oldValue = defaultObj[item.key];

    if (isArray(oldValue)) {
      const newValue = newObj[item.key];
      newObj[item.key] = [...newValue, item.value];
    } else {
      newObj[item.key] = item.value;
    }
  });

  return newObj;
};

const convertArrayToObjectByKeys = (arr, { labelKey, valueKey }) => {
  const convertedObj = (arr || []).reduce((acc, item) => {
    if (item[labelKey]) {
      acc[item[labelKey]] = valueKey ? item[valueKey] : item;
    }

    return acc;
  }, {});

  return convertedObj;
};

const convertObjectToArrayWithIdValue = (obj, idPrefix = "") => {
  const items = [];

  for (var key in obj) {
    const value = obj[key];

    const itemObj = {
      id: `${idPrefix}${key}`,
      value,
    };

    items.push(itemObj);
  }

  return items;
};

const compareByKeys =
  (item1, item2) =>
  (keys = []) => {
    return keys.reduce((acc, key) => {
      return acc && get(item1, key) === get(item2, key);
    }, true);
  };

const uniqByKeys = (arr = [], keysToCheck = []) => {
  return uniqWith(arr, (item1, item2) =>
    compareByKeys(item1, item2)(keysToCheck)
  );
};

const unionByKeys = (origArr = [], arrToMerge = [], keysToCheck = []) => {
  return unionWith(arrToMerge, origArr, (item1, item2) =>
    compareByKeys(item1, item2)(keysToCheck)
  );
};

const insert = ({ arr, item, index }) => {
  const updatedArr = !arr ? [] : arr.slice();
  const finalIndex = isNumber(index) ? index : updatedArr.length;

  updatedArr.splice(finalIndex, 0, item);

  return updatedArr;
};

const updateSingleItem = ({
  arr = [],
  item: updatedItemArg,
  key,
  value,
  index,
  includeAll = false,
}) => {
  const updatedArr = arr.slice();
  let updatedItem = { ...updatedItemArg };
  let finalFromIndex;

  if (isNumber(index)) {
    finalFromIndex = index;
  } else if (key && !value) {
    finalFromIndex = arr.findIndex((item) => item[key] === updatedItem[key]);
  } else {
    finalFromIndex = arr.findIndex(
      (item) => (key ? item[key] : item) === value
    );
  }

  if (finalFromIndex !== -1) {
    if (includeAll) {
      const prevItem = updatedArr[finalFromIndex];

      updatedItem = {
        ...prevItem,
        ...updatedItem,
      };
    }

    updatedArr.splice(finalFromIndex, 1, updatedItem);
  }

  return updatedArr;
};

const updateMultipleByKey = ({ arr = [], items, key, includeAll = false }) => {
  const updatedItemsMap = convertArrayToObjectByKeys(items, {
    labelKey: key,
  });

  return arr.map((item) => {
    const itemToUpdate = updatedItemsMap[item[key]];

    return itemToUpdate
      ? Object.assign({}, includeAll && item, itemToUpdate)
      : item;
  });
};

const update = ({ arr = [], item, key, value, index, includeAll = false }) => {
  if (isArray(item)) {
    return updateMultipleByKey({ arr, items: item, key, includeAll });
  }

  return updateSingleItem({
    arr,
    item,
    key,
    value,
    index,
    includeAll,
  });
};

const updateAll = ({ arr, key, value }) => {
  if (!key) {
    throw '"key" is required';
  } else if (!value) {
    throw '"value" is required';
  }

  return arr.map((item) => ({
    ...item,
    [key]: value,
  }));
};

const remove = ({ arr = [], key = "id", value, index }) => {
  const updatedArr = arr.slice();
  let finalFromIndex;

  if (isNumber(index)) {
    finalFromIndex = index;
  } else {
    finalFromIndex = arr.findIndex(
      (item) => (key ? item[key] : item) === value
    );
  }

  if (finalFromIndex !== -1) {
    updatedArr.splice(finalFromIndex, 1);
  }

  return updatedArr;
};

const insertOrUpdate = ({
  arr = [],
  item,
  key = "id",
  index,
  includeAll = false,
}) => {
  let updatedArr = arr.slice();
  let finalFromIndex;
  const isItemObject = isObject(item);

  if (!isItemObject) {
    finalFromIndex = updatedArr.indexOf(item);
  } else {
    finalFromIndex = updatedArr.findIndex((a) => a[key] === item[key]);
  }

  const updatedItem = !isItemObject
    ? item
    : {
        ...(includeAll && arr[finalFromIndex]),
        ...item,
      };

  if (finalFromIndex !== -1) {
    updatedArr = remove({
      arr: updatedArr,
      index: finalFromIndex,
    });
  }

  updatedArr = insert({
    arr: updatedArr,
    item: updatedItem,
    index,
  });

  return updatedArr;
};

const insertOrRemove = ({ arr = [], item, key }) => {
  let finalFromIndex;

  if (isObject(item)) {
    const finalKey = key || "id";

    finalFromIndex = arr.findIndex((a) => a[finalKey] === item[finalKey]);
  } else {
    finalFromIndex = arr.indexOf(item);
  }

  const exists = finalFromIndex !== -1;

  if (!exists) {
    return insert({
      arr,
      item,
    });
  } else {
    return remove({
      arr,
      index: finalFromIndex,
    });
  }
};

const moveItem = ({ arr = [], key, value, fromIndex, toIndex }) => {
  const updatedArr = arr.slice();
  let finalFromIndex;

  if (isNumber(fromIndex)) {
    finalFromIndex = fromIndex;
  } else {
    finalFromIndex = arr.findIndex(
      (item) => (key ? item[key] : item) === value
    );
  }

  const [itemToMove] = updatedArr.splice(finalFromIndex, 1);

  updatedArr.splice(toIndex, 0, itemToMove);

  return updatedArr;
};

const toggleItem = ({ arr = [], item, key }) => {
  const updatedArr = arr.slice();
  let finalFromIndex;

  if (!key) {
    finalFromIndex = updatedArr.indexOf(item);
  } else {
    finalFromIndex = updatedArr.findIndex((a) => a[key] === item[key]);
  }

  if (finalFromIndex === -1) {
    return insert({
      arr: updatedArr,
      item,
    });
  }

  return remove({
    arr: updatedArr,
    index: finalFromIndex,
  });
};

const mergeTransform = (objValue, srcValue) => {
  if (isArray(srcValue)) {
    return srcValue;
  }
};

const mergeByKeys = (origArr = [], arrToMerge = [], keysToCheck = []) => {
  let mergedArr = arrToMerge.map((item1) => {
    const oldValue = origArr.find((item2) =>
      compareByKeys(item1, item2)(keysToCheck)
    );

    return mergeWith(
      removeUndefinedValues(oldValue),
      removeUndefinedValues(item1),
      mergeTransform
    );
  });

  return mergedArr;
};

const getCombinedKeys = (keys, value) => {
  const combinedKeys = keys.reduce((acc, key) => {
    return acc.concat(value[key] || "null");
  }, []);

  return combinedKeys.join("-");
};

const mergeArraysBySameKeys = (
  origArr = [],
  arrToMerge = [],
  { keysToCheck = [], keysToMerge: keysToMergeArr = [], includeAll }
) => {
  let keysToMerge = keysToMergeArr.slice();

  if (includeAll) {
    const combinedArr = [...origArr, ...arrToMerge];

    keysToMerge = combinedArr.reduce((acc, item) => {
      return uniq([...acc, ...Object.keys(item)]);
    }, []);
  }

  const mergedArr = origArr.reduce((acc, item) => {
    let arr = [...acc];
    const itemToMerge = arrToMerge.find((m) =>
      keysToCheck.reduce((keyAcc, key) => {
        const isItemSameKeyVal = m[key] === item[key];

        return isItemSameKeyVal && keyAcc;
      }, true)
    );

    if (itemToMerge) {
      arr = acc.concat({
        ...removeUndefinedValues(item),
        ...Object.entries(removeUndefinedValues(itemToMerge)).reduce(
          (keysToMergeAcc, [key, value]) => {
            if (keysToMerge.includes(key)) {
              keysToMergeAcc[key] = value;
            }

            return keysToMergeAcc;
          },
          {}
        ),
      });
    }

    return arr;
  }, []);

  return mergedArr;
};

const mergeAndAddArraysBySameKeys = (
  origArrArg = [],
  arrToMerge = [],
  {
    keysToCheck = [],
    keysToMerge: keysToMergeArr = [],
    priorities,
    includeAll,
    removeMissing,
  }
) => {
  let origArr = origArrArg.slice();

  if (removeMissing) {
    origArr = origArrArg.filter((m) => {
      const hasMissing = !arrToMerge.some((item) =>
        keysToCheck.some((key) => m[key] === item[key])
      );

      return !hasMissing;
    });
  }

  let combinedArr = [
    ...origArr.map((item) => ({
      ...item,
      ...(!includeAll && { isOrig: true }),
    })),
    ...arrToMerge,
  ];
  let keysToMerge = keysToMergeArr.slice();

  if (includeAll) {
    combinedArr = unionByKeys(origArr, arrToMerge, keysToCheck);
    combinedArr = mergeByKeys(origArr, combinedArr, keysToCheck);

    combinedArr = sortArrayByPriority(
      combinedArr,
      keysToCheck[0],
      origArr.map((item) => item[keysToCheck[0]])
    );

    keysToMerge = combinedArr.reduce((acc, item) => {
      return uniq([...acc, ...Object.keys(item)]);
    }, []);

    return combinedArr;
  }

  const mergedArr = mergeArraysBySameKeys(origArr, arrToMerge, {
    keysToCheck,
    keysToMerge,
  });

  const unmergedArr = combinedArr
    .filter(
      (m) =>
        !mergedArr.some((item) =>
          keysToCheck.some((key) => m[key] === item[key])
        )
    )
    .map((item) => ({
      ...Object.entries(item).reduce((keysToMergeAcc, [key, value]) => {
        const itemObj = { ...item };
        let origItemKeys = [];

        if (itemObj.isOrig) {
          delete itemObj.isOrig;

          origItemKeys = Object.keys(itemObj);
        }

        if ([...origItemKeys, ...keysToCheck, ...keysToMerge].includes(key)) {
          keysToMergeAcc[key] = value;
        }

        return keysToMergeAcc;
      }, {}),
    }));

  const sortedIds =
    priorities || uniq(combinedArr.map((item) => item[keysToCheck[0]]));

  return sortArrayByPriority(
    mergedArr.concat(unmergedArr),
    "fieldId",
    sortedIds
  );
};

const getPropertiesWithValues = (obj = {}, excludes = []) => {
  const arr = convertPropertiesToArray(obj);
  const itemExists = (uniqueArr, item) => {
    return uniqueArr.some((arrValue) => arrValue.key === item.key);
  };

  const filteredArr = arr.filter((item) => {
    const itemValue = item.value;
    if (isArray(itemValue)) {
      return Boolean(itemValue.length);
    } else if (typeof itemValue === "object") {
      const nestedArr = convertPropertiesToArray(itemValue);

      return Boolean(nestedArr.length);
    } else {
      return Boolean(itemValue) && !excludes.includes(itemValue);
    }
  });

  const flattenedArr = filteredArr.reduce((acc, item) => {
    const result = acc.slice();
    const itemKey = item.key;
    const itemValue = item.value;

    if (isArray(itemValue)) {
      itemValue.forEach((nestedItem, index) => {
        result.push({
          key: itemKey,
          value: nestedItem,
          id: `${itemKey}${index}`,
        });
      });
    } else if (!itemExists(acc, item)) {
      result.push({ ...item, id: item.key });
    }

    return result;
  }, []);

  return flattenedArr;
};

const arrayConcatOrUpdateByKey = ({
  arr = [],
  item,
  key = "id",
  includeAll = false,
  first = false,
}) => {
  const itemToUpdate = arr.find((d) => d[key] === item[key]);

  if (!itemToUpdate) {
    return first
      ? insert({
          arr,
          item,
          index: 0,
        })
      : arr.concat(item);
  }

  return update({
    arr,
    item,
    key,
    includeAll,
  });
};

const arraySwapItems = ({ arr = [], values = [], key }) => {
  const [val1, val2] = values;
  const updatedArr = [...arr];

  let itemIndex1;
  let itemIndex2;

  if (key) {
    const primValue1 = isObject(val1)
      ? val1[key]
      : isNumber(Number(val1) || "")
      ? val1 - 1
      : val1;
    const primValue2 = isObject(val2)
      ? val2[key]
      : isNumber(Number(val2) || "")
      ? val2 - 1
      : val2;

    itemIndex1 = arr.findIndex(
      (d, index) =>
        (isNumber(Number(val1) || "") ? index : d[key]) === primValue1
    );
    itemIndex2 = arr.findIndex(
      (d, index) =>
        (isNumber(Number(val2) || "") ? index : d[key]) === primValue2
    );

    updatedArr[itemIndex1] = {
      ...arr[itemIndex2],
      ...(isObject(val2) && val2),
    };
    updatedArr[itemIndex2] = {
      ...arr[itemIndex1],
      ...(isObject(val1) && val1),
    };
  } else {
    itemIndex1 = val1 - 1;
    itemIndex2 = val2 - 1;

    updatedArr[itemIndex1] = arr[itemIndex2];
    updatedArr[itemIndex2] = arr[itemIndex1];
  }

  return updatedArr;
};

const parseTraverseNotation = (notation = "") => {
  const objVal = {
    itemKey: "",
    arrayItemKey: "",
    itemKeyValue: "",
  };
  const splitNotation = notation.split(":");

  switch (splitNotation.length) {
    case 1: {
      objVal.itemKey = splitNotation[0];
      break;
    }
    case 2: {
      objVal.itemKey = splitNotation[0];
      objVal.itemKeyValue = splitNotation[1];
      break;
    }
    case 3: {
      objVal.itemKey = splitNotation[0];
      objVal.arrayItemKey = splitNotation[1];
      objVal.itemKeyValue = splitNotation[2];
      break;
    }
  }

  return objVal;
};

const noArrayNotations = (notations) => {
  const notationsArr = isString(notations) ? [notations] : notations;

  return (
    !!notationsArr.length &&
    notationsArr.every(
      (notation) => !parseTraverseNotation(notation).itemKeyValue
    )
  );
};

const traverse = ({
  objectOrArray,
  notations: notationsArg,
  value,
  traversed,
  handleArray,
  handleObject,
}) => {
  const notations = isString(notationsArg) ? [notationsArg] : notationsArg;

  if (!traversed && !notations?.length) {
    throw "Notations are required";
  }

  const notationsArr = [...notations];
  const currentNotation = notationsArr.shift();
  const nextNotation = notationsArr[0];
  const isLastNotation = !notationsArr.length;
  const parsedCurrentNotation = parseTraverseNotation(currentNotation);
  const parsedNextNotation = parseTraverseNotation(nextNotation);
  let currentValue;

  if (!isLastNotation) {
    if (isArray(objectOrArray)) {
      currentValue = objectOrArray.find(
        (item) =>
          item[parsedCurrentNotation.itemKey] ===
          parsedCurrentNotation.itemKeyValue
      );

      return arrayConcatOrUpdateByKey({
        arr: objectOrArray,
        item: {
          [parsedCurrentNotation.itemKey]: parsedCurrentNotation.itemKeyValue,
          [parsedNextNotation.itemKey]: traverse({
            objectOrArray: currentValue,
            notations: notationsArr,
            value,
            traversed: true,
            handleArray,
            handleObject,
          }),
        },
        key: parsedCurrentNotation.itemKey,
        includeAll: true,
      });
    } else {
      currentValue = objectOrArray?.[parsedCurrentNotation.itemKey];

      return {
        ...objectOrArray,
        [parsedCurrentNotation.itemKey]: traverse({
          objectOrArray: currentValue,
          notations: notationsArr,
          value,
          traversed: true,
          handleArray,
          handleObject,
        }),
      };
    }
  } else {
    if (isArray(objectOrArray)) {
      currentValue = objectOrArray.find(
        (item) =>
          item[parsedCurrentNotation.itemKey] ===
          parsedCurrentNotation.itemKeyValue
      );
    } else {
      currentValue = objectOrArray?.[parsedCurrentNotation.itemKey];
    }

    if (isArray(currentValue)) {
      return handleArray({
        currentValue,
        newValue: value,
        currentNotation: parsedCurrentNotation,
      });
    } else {
      return handleObject({
        currentValue,
        newValue: value,
        currentNotation: parsedCurrentNotation,
      });
    }
  }
};

const traverseRead = (objectOrArray, notations) => {
  let traversedValue;

  traverse({
    handleArray: ({ currentValue }) => {
      traversedValue = currentValue;
    },
    handleObject: ({ currentValue }) => {
      traversedValue = currentValue;
    },
    objectOrArray,
    notations,
  });

  return traversedValue;
};

const traverseAddEdit = (objectOrArray, notations, value) => {
  const noArray = noArrayNotations(notations);

  if (noArray) {
    const mutatedObj = { ...objectOrArray };
    set(mutatedObj, notations, value);

    return mutatedObj;
  }

  return traverse({
    handleArray: ({ currentValue, newValue }) => {
      return arrayConcatOrUpdateByKey({
        arr: currentValue,
        item: newValue,
        // key: currentNotation.itemKey,
        includeAll: true,
      });
    },
    handleObject: ({ currentValue, newValue, currentNotation }) => {
      return !isObject(currentValue)
        ? newValue
        : {
            ...currentValue,
            [currentNotation.itemKey]: newValue,
          };
    },
    objectOrArray,
    notations,
    value,
  });
};

const traverseDelete = (objectOrArray, notations) => {
  const notationsArr = notations.slice();
  const lastNotation = notationsArr.pop();
  const parsedLastNotation = parseTraverseNotation(lastNotation);

  return traverse({
    handleArray: ({ currentValue }) =>
      remove({
        arr: currentValue,
        key: parsedLastNotation.itemKey,
        value: parsedLastNotation.itemKeyValue,
      }),
    handleObject: () => null,
    objectOrArray,
    notations: notationsArr,
  });
};

const hasItemValue = (arr, keyValueMappingOrCallback) =>
  !!findItem(arr, keyValueMappingOrCallback);

const hasItem = (...args) => {
  return !!traverseRead(...args);
};

module.exports = {
  getLastItem,
  findItem,
  findItemIndex,
  filterItems,
  every,
  some,
  hasDuplicates,
  splice,
  compareObjectByValue,
  compareObjectByPriority,
  compareObjectByCondition,
  compareObjectByGroups,
  sortArray,
  sortArrayByObjectKey,
  sortArrayByPriority,
  sortArrayByKeyCondition,
  sortArrayByKeyValues,
  sortArrayByKeyValuesIncludeAll,
  sortArrayByObjectGroups,
  groupByKey,
  groupByKeys,
  groupBy,
  convertPropertiesToArray,
  convertArrayToObject,
  convertArrayToObjectByKeys,
  convertObjectToArrayWithIdValue,
  compareByKeys,
  uniqByKeys,
  unionByKeys,
  insert,
  updateSingleItem,
  updateMultipleByKey,
  update,
  updateAll,
  remove,
  insertOrUpdate,
  insertOrRemove,
  moveItem,
  toggleItem,
  mergeTransform,
  mergeByKeys,
  getCombinedKeys,
  mergeArraysBySameKeys,
  mergeAndAddArraysBySameKeys,
  getPropertiesWithValues,
  arrayConcatOrUpdateByKey,
  arraySwapItems,
  parseTraverseNotation,
  noArrayNotations,
  traverse,
  traverseRead,
  traverseAddEdit,
  traverseDelete,
  hasItemValue,
  hasItem,
};

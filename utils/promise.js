const isArray = require("lodash/isArray");
const isFunction = require("lodash/isFunction");

const runPromise = (callback) => {
  return new Promise((resolve, reject) => {
    callback(resolve, reject);
  });
};

const delay = (timeout, val) =>
  runPromise(function (resolve) {
    setTimeout(() => resolve(val), timeout);
  });

const syncPromises = async (arr = [], promiseCallback) => {
  return await arr.reduce(async (acc, valueOrCallback, currentIndex) => {
    const accArr = await acc;

    let result;

    if (isArray(valueOrCallback)) {
      result = await syncPromises(
        valueOrCallback,
        !promiseCallback ? null : (val) => promiseCallback(val, currentIndex)
      );
    } else if (promiseCallback) {
      result = await promiseCallback(valueOrCallback, currentIndex, accArr);
    } else if (isFunction(valueOrCallback)) {
      result = await valueOrCallback(currentIndex, accArr);
    } else {
      result = valueOrCallback;
    }

    return [...accArr, result];
  }, Promise.resolve([]));
};

const asyncPromises = async (arr = [], promiseCallback) => {
  return await Promise.all(
    arr.map(async (valueOrCallback, currentIndex) => {
      let result;

      if (promiseCallback) {
        result = await promiseCallback(valueOrCallback, currentIndex);
      } else if (isArray(valueOrCallback)) {
        result = await asyncPromises(valueOrCallback, promiseCallback);
      } else if (isFunction(valueOrCallback)) {
        result = await valueOrCallback(currentIndex);
      } else {
        result = valueOrCallback;
      }

      return result;
    })
  );
};

const getPromisesArgs = (promisesArgs) => {
  if (isArray(promisesArgs[0])) {
    return promisesArgs[0];
  }

  return promisesArgs;
};

async function* promisesGenerator(...promisesArgs) {
  const promises = getPromisesArgs(promisesArgs);

  for (let i = 0; i < promises.length; i++) {
    const promise = promises[i];

    yield await promise;
  }
}

const runPromisesGenerator = async (...promisesArgs) => {
  const promises = getPromisesArgs(promisesArgs);

  const gen = promisesGenerator(...promises);

  return syncPromises(promises, async () => {
    const result = await gen.next();

    return result.value;
  });
};

module.exports = {
  delay,
  syncPromises,
  asyncPromises,
  runPromise,
  promisesGenerator,
  runPromisesGenerator,
};

function* delay(timeout, val) {
  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve(val);
    }, timeout);
  });
}

// sync
const delayTime = delay()
  .next()
  .value.then((n) => console.log(n))
  .catch((e) => console.error(e));

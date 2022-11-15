function delay(timeout, val) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(val);
    }, timeout);
  });
}

async function* promisesGenerator(...promises) {
  for (let i = 0; i < promises.length; i++) {
    const promise = promises[i];

    yield await promise;
  }
}

async function generate() {
  const gen = promisesGenerator(
    delay(1000, "test1"),
    delay(500, "test2"),
    delay(3000, "test3")
  );

  const test1 = await gen.next();
  if (!test1.done) {
    console.debug(test1.value);
  }

  const test2 = await gen.next();
  if (!test2.done) {
    console.debug(test2.value);
  }

  const test3 = await gen.next();
  if (!test3.done) {
    console.debug(test3.value);
  }

  const test4 = await gen.next();
  if (!test4.done) {
    console.debug(test4.value);
  }
}

await generate();

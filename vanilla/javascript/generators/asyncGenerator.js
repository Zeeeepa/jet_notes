function delay(timeout, val) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(val);
    }, timeout);
  });
}

async function* foo() {
  yield await Promise.resolve("a");
  yield await delay(500, "b");
  yield await Promise.resolve("c");
}

async function generate1() {
  const gen = foo();

  await gen.next().then((res) => console.debug(res.value));
  await gen.next().then((res) => console.debug(res.value));
  await gen.next().then((res) => console.debug(res.value));
}

async function generate2() {
  const gen = foo();

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

async function generate3() {
  let str = "";

  for await (const val of foo()) {
    console.debug(val);
    str = str + val;
  }

  return str;
}

await generate3();

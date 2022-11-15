function testForOf() {
  const array1 = ["a", "b", "c"];

  for (const element of array1) {
    console.debug(element);
  }
}

function testForIn() {
  const object = { a: 1, b: 2, c: 3 };

  for (const property in object) {
    console.debug(`${property}: ${object[property]}`);
  }

  // Expected output:
  // "a: 1"
  // "b: 2"
  // "c: 3"
}

async function testForAwait() {
  async function* foo() {
    yield 2000;
    yield 1000;
  }

  async function run() {
    for await (const num of foo()) {
      new Promise(() => {
        setTimeout(() => {
          console.debug(num);

          resolve();
        }, num);
      });
    }
  }

  // Runs asynchronously
  run();

  // Expected output:
  // 1000
  // 2000
}

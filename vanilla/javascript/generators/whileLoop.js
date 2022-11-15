function* UUIDGenerator() {
  let d, r;
  while (true) {
    yield "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      r = (new Date().getTime() + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

const UUID = UUIDGenerator();
// UUID is our generator object
UUID.next();
// return {value: 'e35834ae-8694-4e16-8352-6d2368b3ccbf', done: false}

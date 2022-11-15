class MyClass extends EventTarget {
  doSomething() {
    this.dispatchEvent(new Event("something"));
  }
}

const instance = new MyClass();
instance.addEventListener("something", (e) => {
  console.log('Instance fired "something".', e);
});
instance.doSomething();

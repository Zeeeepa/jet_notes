/**
 * Differences between Map and WeakMap | Set and WeakSet
 *
 * 1) A WeakMap accepts only objects as keys whereas a Map,in addition to objects,
 * accepts primitive datatype such as strings, numbers etc.
 *
 * 2) WeakMap objects doesn't avert garbage collection if there are no references
 * to the object which is acting like a key. Therefore there is no method to retrieve keys in WeakMap,
 * whereas in Map there are methods such as Map.prototype.keys() to get the keys.
 *
 * 3) There is no size property exists in WeakMap.
 */

/**
 * Reasons to use WeakMap | WeakSet
 *
 * 1.) The first one is an O(n) search (n being the number of keys in the map).
 *
 * 2.) The second one is a memory leak issue. With manually written maps, the array of keys would keep
 * references to key objects, preventing them from being garbage collected.
 * In native WeakMaps, references to key objects are held "weakly", which means that they do not
 * prevent garbage collection in case there would be no other reference to the object.
 */

function testMap() {
  let myMap = new Map();
  let obj = {};
  myMap.set(1, obj);
  console.debug(myMap.has(1));

  obj = 5;

  console.debug(myMap.has(obj));
}

function testSet() {
  let mySet = new Set();

  mySet.add("Value 1");
  mySet.add("Value 2");
  mySet.add("Value 2");
  mySet.add("Value 3");
  mySet.add("Value 2");

  const values = Array.from(mySet.values());

  console.debug(values);
}

function testWeakMap() {
  let myWeakMap = new WeakMap();
  let obj = {};
  myWeakMap.set(obj);
  console.debug(myWeakMap.has(obj));

  // break the last reference to the object we created earlier
  obj = 5;

  // false because no other references to the object which the weakMap points to
  // because weakMap was the only object holding a reference it released it and got garbage collected
  console.debug(myWeakMap.has(obj));
}

function testWeakSet() {
  let myWeakSet = new WeakSet();
  let obj = {};
  myWeakSet.add(obj);
  console.debug(myWeakSet.has(obj));

  // break the last reference to the object we created earlier
  obj = 5;

  // false because no other references to the object which the weakset points to
  // because weakset was the only object holding a reference it released it and got garbage collected
  console.debug(myWeakSet.has(obj));
}

/**
 * JS Performance Bench Test
 * https://jsbench.me/l2lc28b82d/1
 */

/**
 * Binary search is a much faster algorithm because of the way it works.
 * At any given point it eliminates half of the array.
 */

const recursiveFunction = function (arr, x, start, end) {
  // Base Condition
  if (start > end) return false;

  // Find the middle index
  const mid = Math.floor((start + end) / 2);

  // Compare mid with given key x
  if (arr[mid] === x) return true;

  // If element at mid is greater than x,
  // search in the left half of mid
  if (arr[mid] > x) return recursiveFunction(arr, x, start, mid - 1);
  // If element at mid is smaller than x,
  // search in the right half of mid
  else return recursiveFunction(arr, x, mid + 1, end);
};

const iterativeFunction = function (arr, x) {
  let start = 0,
    end = arr.length - 1;

  // Iterate while start not meets end
  while (start <= end) {
    // Find the mid index
    let mid = Math.floor((start + end) / 2);

    // If element is present at mid, return True
    if (arr[mid] === x) return true;
    // Else look in left or right half accordingly
    else if (arr[mid] < x) start = mid + 1;
    else end = mid - 1;
  }

  return false;
};

function testRecursive() {
  // Driver code
  let arr = [1, 3, 5, 7, 8, 9];
  let x = 5;

  if (recursiveFunction(arr, x, 0, arr.length - 1))
    console.log("Element found!<br>");
  else console.log("Element not found!<br>");

  x = 6;

  if (recursiveFunction(arr, x, 0, arr.length - 1))
    console.log("Element found!<br>");
  else console.log("Element not found!<br>");
}

function testIterative() {
  // Driver code
  let arr = [1, 3, 5, 7, 8, 9];
  let x = 5;

  if (iterativeFunction(arr, x, 0, arr.length - 1))
    console.log("Element found!<br>");
  else console.log("Element not found!<br>");

  x = 6;

  if (iterativeFunction(arr, x, 0, arr.length - 1))
    console.log("Element found!<br>");
  else console.log("Element not found!<br>");
}

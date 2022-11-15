/**
 * https://stackoverflow.com/questions/64564266/check-if-a-piece-of-the-element-is-in-viewport
 *
 * This is set up to make it consider anything that's 50% within the viewport as within the threshold. I made it such a large value so it's easy to see how it works.
 * As you'll notice with this, the callback is only called at the threshold (after the initial check). So, if you want an accurate intersection percentage, you'll probably want to increase the number of thresholds checked.
 */

let callback = (entries, observer) => {
  entries.forEach((entry) => {
    entry.target.style.backgroundColor = entry.isIntersecting ? "green" : "red";
    entry.target.innerHTML = entry.intersectionRatio;
  });
};
let observer = new IntersectionObserver(callback, {
  threshold: [0.5], // If 50% of the element is in the screen, we count it!
  // Can change the thresholds based on your needs. The default is 0 - it'll run only when the element first comes into view
});

["div1", "div2", "div3", "div4"].forEach((d) => {
  const div = document.getElementById(d);
  if (div) observer.observe(div);
});

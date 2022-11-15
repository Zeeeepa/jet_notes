// fs-extra contains methods that aren't included in the vanilla Node.js fs package
// Such as recursive mkdir, copy, and remove.
const fse = require("fs-extra");
const recursive = require("recursive-readdir");

// const rootFolder = `${__dirname}/root`;
const rootFolder = "../Macanta_New_Web/src/graphql/automation";

recursive(rootFolder, ["*.md", "*.html"], function (err, files) {
  console.log("FILES:\n", files);
});

// // ignore files named "foo.cs" or files that end in ".html".
// recursive(rootFolder, ["foo.cs", "*.html"], function (err, files) {
//   console.log(files);
// });

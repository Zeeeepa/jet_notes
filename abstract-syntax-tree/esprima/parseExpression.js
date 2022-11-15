var esprima = require("esprima");
var program = "const answer = 42";

const tokenized = esprima.tokenize(program);
const parsed = esprima.parseScript(program);

console.log("Program:\n", program, "\n");
console.log("Tokenized:\n", tokenized, "\n");
console.log("Parsed:\n", parsed, "\n");

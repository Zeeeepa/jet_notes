const fs = require("fs").promises;
const path = require("path");
const espree = require("espree");

function checkTopLevelClasses(ast) {
  let topLevelClassCounter = ast.body.reduce((counter, node) => {
    if (node.type === "ClassDeclaration") {
      counter++;
    }
    return counter;
  }, 0);

  if (topLevelClassCounter > 1) {
    throw new Error(
      `Found ${topLevelClassCounter} top level classes. Expected not more than one.`
    );
  }
}

async function run() {
  const fileName = path.resolve(process.cwd(), process.argv[2]);
  const content = await fs.readFile(fileName, "utf8");
  console.log(fileName);

  const ast = espree.parse(content, { ecmaVersion: 2019 });
  checkTopLevelClasses(ast);
}

run().catch(console.error);

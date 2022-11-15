import * as babel from "@babel/core";
import { getPathInfo } from "../../../../utils/file";
import { BABEL_OPTIONS } from "../../babelOptions";
import { readSourceFile } from "../../utils/reader";

const run = async () => {
  const pathToFile = "../../static_samples/react-ast-to-code.js";

  return parseAst(pathToFile, { isPath: true });
};

export const parseAst = async (codeOrPath, { isPath } = {}) => {
  const sourceCode = !isPath
    ? codeOrPath
    : await readSourceFile(codeOrPath, __dirname);

  babel.parseAsync(sourceCode, BABEL_OPTIONS).then((ast) => {
    return traverseAst(ast);
  });
};

export const traverseAst = (ast, opts, ...args) => {
  // console.log("PARSED AST:\n", ast, "\n");
  // console.log("TRAVERSED AST:\n");

  babel.traverse(
    ast,
    {
      noScope: true,
      // enter(path) {
      //   // if (path.node.type === "Identifier") {
      //   //   console.log(path.node);
      //   // }

      //   console.log("\n**NODE**\n", path.node, "\n**END NODE**\n");
      // },
      ...opts,
    },
    ...args
  );
};

if (process.argv.length) {
  const info = getPathInfo(process.argv[1]);

  if (info.fileName.startsWith("traverse-ast")) {
    run();
  }
}

import * as babel from "@babel/core";
import { BABEL_OPTIONS } from "../../babelOptions";
import { readSourceFile } from "../../utils/reader";
import { prettify } from "../../utils/codeTransforms";

const run = async () => {
  const pathToFile = "../../static_samples/react-ast-to-code.js";

  const sourceCode = await readSourceFile(pathToFile, __dirname);

  babel
    .parseAsync(sourceCode, BABEL_OPTIONS)
    .then((parsedAst) => {
      console.log("\n**AST**\n", JSON.stringify(parsedAst), "\n**END AST**\n");
      return babel.transformFromAstAsync(parsedAst, sourceCode, BABEL_OPTIONS);
    })
    .then(({ code, map, ast }) => {
      const prettifiedCode = prettify(code);

      console.log(`\n**REACT CODE**\n${prettifiedCode}\n**END REACT CODE**\n`);

      return prettifiedCode;
    });
};

run();

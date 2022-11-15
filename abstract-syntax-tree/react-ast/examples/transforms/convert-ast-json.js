import * as babel from "@babel/core";
import { isString, pick } from "lodash";
import { getPathInfo } from "../../../../utils/file";
import {
  readObjectProperties,
  replaceProperties,
} from "../../../../utils/object";
import { replace } from "../../../../utils/string";
import { BABEL_OPTIONS } from "../../babelOptions";
import { readSourceLines } from "../../utils/reader";
import { traverseAst } from "../basic/traverse-ast";
import {
  lintAndPrettifyCode,
  lintAndPrettifyCodeFromFile,
} from "./convert-js-ast";

const getLastItem = (arr = []) => arr.slice(-1)[0];

const parseASTFromJavascriptFile = async (
  pathToFile,
  directory = __dirname,
  options = BABEL_OPTIONS
) => {
  const prettifiedCode = await lintAndPrettifyCodeFromFile(
    pathToFile,
    directory
  );

  const ast = babel.parseSync(prettifiedCode, options);

  return ast;
};

const parseCodeFromAST = (ast) => {
  const { code } = babel.transformFromAstSync(ast, "", BABEL_OPTIONS);

  return lintAndPrettifyCode(code);
};

const run = async () => {
  const pathToFile = "../../static_samples/templates/lambdaRoot/template.js";

  const ast = await parseASTFromJavascriptFile(pathToFile);
  // console.log("\n**AST**\n", JSON.stringify(ast), "\n**END AST**\n");

  const switchCaseNodesArr = readObjectProperties(ast, [
    { type: "SwitchCase" },
  ]);
  const switchCaseNodes = switchCaseNodesArr.filter(
    (item) => item.test?.type === "StringLiteral"
  );
  const lastSwitchCaseNode = getLastItem(switchCaseNodes);
  const literalValue =
    lastSwitchCaseNode.test?.value || lastSwitchCaseNode.test;

  // console.log("Last SwitchCase Node:", lastSwitchCaseNode);

  let updatedAst = replaceProperties(
    ast,
    (val, { key }) => key === "cases",
    (arr) => {
      const defaultNode = switchCaseNodesArr.filter(
        (item) => item.test?.type !== "StringLiteral"
      );
      const newNode = replaceProperties(
        lastSwitchCaseNode,
        (val) => isString(val) && val.includes(literalValue),
        (val) => replace(val, literalValue, "newField")
      );

      // console.log("New SwitchCase Node:", newNode);

      return [...switchCaseNodes, newNode, ...defaultNode];
    }
  );

  const bodyArr = updatedAst.program.body;
  const importNodesArr = bodyArr.filter(
    (item) => item.type === "VariableDeclaration"
  );
  const lastImportNode = getLastItem(importNodesArr);

  updatedAst = replaceProperties(
    updatedAst,
    (val) => val?.type === "Program",
    (val) => {
      const otherBodyNodes = bodyArr.filter(
        (item) => item.type !== "VariableDeclaration"
      );
      const newNode = replaceProperties(
        lastImportNode,
        (val) => isString(val) && val.includes(literalValue),
        (val) => replace(val, literalValue, "newField")
      );

      return { ...val, body: [...importNodesArr, newNode, ...otherBodyNodes] };
    }
  );

  // console.log("\n**AST**\n", JSON.stringify(updatedAst), "\n**END AST**\n");

  const code = parseCodeFromAST(updatedAst);
  console.log(`\n**CODE**\n${code}\n**END CODE**\n`);

  // const options = pick(lastSwitchCaseNode, ["start", "end"]);
  // readSourceLines(pathToFile, options, __dirname).then((result) => {
  //   console.log(
  //     `\n**START LINE: ${options.start}**\n`,
  //     result,
  //     `\n**END LINE: ${options.end}**\n`
  //   );
  // });

  /*
  traverseAst(ast, {
    enter(path) {
      // if (path.node.type === "SwitchStatement") {
      //   console.log(
      //     "\n**SwitchStatement NODE**\n",
      //     path.node,
      //     "\n**END SwitchStatement NODE**\n"
      //   );
      // }

      if (path.node.type === "SwitchCase") {
        // console.log("\n**NODE**\n", path.node, "\n**END NODE**\n");

        const options = pick(path.node, ["start", "end"]);

        readSourceLines(pathToFile, options, __dirname).then((result) => {
          console.log(
            `\n**START LINE: ${options.start}**\n`,
            result,
            `\n**END LINE: ${options.end}**\n`
          );
        });
      }
    },
  });
  */
};

if (process.argv.length) {
  const info = getPathInfo(process.argv[1]);

  if (info.fileName.startsWith("convert-ast-json")) {
    run();
  }
}

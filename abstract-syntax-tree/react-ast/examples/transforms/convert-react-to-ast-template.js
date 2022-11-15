import * as babel from "@babel/core";
import generate from "@babel/generator";
import { readSourceFile } from "../../utils/reader";
import { getPathInfo } from "../../../../utils/file";
import { BABEL_OPTIONS } from "../../babelOptions";
import { prettify } from "../../utils/codeTransforms";
import { traverseAst } from "../basic/traverse-ast";
import {
  readKeys,
  readObjectProperties,
  replaceKeys,
} from "../../../../utils/object";
import uniqBy from "lodash/uniqBy";
import isArray from "lodash/isArray";

const DEFAULT_TYPES = ["Object", "Array", "Property", "Identifier", "Literal"];

const parseAstFromFile = async (
  pathToFile,
  directory = __dirname,
  options = BABEL_OPTIONS
) => {
  const sourceCode = await readSourceFile(pathToFile, directory);

  const ast = babel.parseSync(sourceCode, options);

  return ast;
};

export const generateTemplateFromAst = async (ast, opts, ...args) => {
  const templateCodes = readObjectProperties(ast, {
    type: "ImportDeclaration",
    transform: (node) => {
      const pathKeys = readKeys(node, ["type"]);
      const keyMappingWithTransform = [
        {
          "specifiers.type": "ImportDefaultSpecifier",
          transform: (item) => ({
            attribute: "defaultSpecifier",
            value: item.local.name,
          }),
        },
        {
          "specifiers.type": "ImportSpecifier",
          transform: (item) => ({
            attribute: "specifiers",
            value: item.local.name,
          }),
        },
        {
          "specifiers.type": "ImportNamespaceSpecifier",
          transform: (item) => ({
            attribute: "namespaceSpecifier",
            value: item.local.name,
          }),
        },
        {
          "source.type": "StringLiteral",
          transform: (item) => ({
            attribute: "source",
            value: item.value,
          }),
        },
      ];

      const keyMapping = readObjectProperties(node, keyMappingWithTransform);
      const attributes = keyMapping.reduce((acc, { attribute: key, value }) => {
        const accObj = { ...acc };

        const attributeValue = accObj[key];

        accObj[key] = !attributeValue ? value : [attributeValue].concat(value);

        return accObj;
      }, {});

      console.log(
        "\n**ImportDeclaration**\n",
        {
          pathKeys,
          attributes,
        },
        "\n**END ImportDeclaration**\n"
      );

      return generateReactCode("ImportDeclaration", attributes);
    },
  });

  const templateCode = prettify(`
    <>
      ${templateCodes.join("\n")}
    </>
  `);

  console.debug(`TEMPLATE CODE:\n${templateCode}\n`);

  return templateCode;
};

const generateReactCode = (elementName, attributes, hasImport) => {
  let code = `
    <${elementName}
      ${Object.keys(attributes)
        .map((key) => {
          const value = attributes[key];
          const jsxValue = isArray(value)
            ? `{[${value.map((v) => `"${v}"`)}]}`
            : `"${value}"`;

          return `${key}=${jsxValue}`;
        })
        .join("\n")}
    />
  `;

  if (hasImport) {
    code = `import {${elementName}} from "react-ast"\n` + code;
  }

  return code;
};

export const generateCodeFromAst = (ast) => {
  const output = generate(ast);

  const code = output.code;

  return code;
};

const run = async () => {
  const pathToFile = "../../static_samples/sample-react.jsx";

  const ast = await parseAstFromFile(pathToFile);
  // console.log("\n**AST**\n", JSON.stringify(ast), "\n**END AST**\n");

  // const code = generateCodeFromAst(ast);
  // console.log(`\n**REACT CODE**\n${code}\n**END REACT CODE**\n`);

  const template = generateTemplateFromAst(ast);
};

if (process.argv.length) {
  const info = getPathInfo(process.argv[1]);

  if (info.fileName.startsWith("convert-react-to-ast-template")) {
    run();
  }
}

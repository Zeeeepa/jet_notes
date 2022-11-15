import { readSourceFile } from "../../utils/reader";
import parse from "json-to-ast";
import { merge, readKeys, replaceProperties } from "../../../../utils/object";
import { traverseAst } from "../basic/traverse-ast";
import { isPureObject } from "../../../../utils/value";
import { getPathInfo } from "../../../../utils/file";

// const DEFAULT_TYPES = ["Object", "Array", "Property", "Identifier", "Literal"];

const transformChildren = (children) => {
  const result = children.reduce((acc, item, index) => {
    const accObj = { ...acc };

    const attribute = item.key?.value || index;
    const type = item.value?.type || item.type;
    const value = item.value?.value ?? item.value;
    const children = item.children || item.value?.children;
    const hasChildren = !!children;

    accObj[attribute] = hasChildren ? transformChildren(children) : value;

    if (hasChildren && type === "Array") {
      accObj[attribute] = Object.values(accObj[attribute]);
    }

    return accObj;
  }, {});

  return result;
};

export const parseAstJson = (sourceJson) => {
  const settings = {
    loc: false,
  };

  const ast = parse(sourceJson, settings);

  const parsedAst = replaceProperties(
    ast,
    (val) => isPureObject(val) && ["Object", "Array"].includes(val.type),
    (val) => {
      if (val.type === "Object") {
        const astObj = transformChildren(val.children);

        return astObj;
      }
    }
  );

  traverseAst(parsedAst);

  return parsedAst;
};

export const parseAstFromJSONFile = async (pathToFile) => {
  const sourceJson = await readSourceFile(pathToFile, __dirname);
  const ast = JSON.parse(sourceJson);

  traverseAst(ast);

  return ast;
};

const run = async () => {
  const pathToFile = "../../static_samples/sample-lambda-ast.json";

  parseAstFromJSONFile(pathToFile);
};

if (process.argv.length) {
  const info = getPathInfo(process.argv[1]);

  if (info.fileName.startsWith("convert-astjson-react")) {
    run();
  }
}

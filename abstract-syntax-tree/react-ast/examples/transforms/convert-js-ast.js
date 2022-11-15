import * as babel from "@babel/core";
import { BABEL_OPTIONS } from "../../babelOptions";
import { readSourceFile } from "../../utils/reader";
import { lint, prettify } from "../../utils/codeTransforms";
import { getEndString, replaceStrings } from "../../../../utils/string";
import isFunction from "lodash/isFunction";
import isArray from "lodash/isArray";
import isString from "lodash/isString";
import { isPureObject } from "../../../../utils/value";
import { createOrUpdateFile, getPathInfo } from "../../../../utils/file";
import { syncPromises } from "../../../../utils/promise";
import { camelCase } from "lodash";
import {
  convertObject,
  prependNotation,
  wrapValuesWithText,
  wrapValuesWithRequire,
  convertObjectToString,
  convertImports,
} from "../../static_samples/templates/utils";
import { allFieldNames, lambdaConfig } from "../../static_samples/lambdaConfig";
import { getFunctionString } from "../../../../utils/function";

export const lintAndPrettifyCode = (code) => {
  const lintedCode = lint(code);
  // console.log(`\n**LINTED CODE**\n${lintedCode}\n**END LINTED CODE**\n`);
  const prettifiedCode = prettify(lintedCode);

  return prettifiedCode;
};

export const lintAndPrettifyCodeFromFile = async (
  pathToFile,
  directory = __dirname
) => {
  const sourceCode = await readSourceFile(pathToFile, directory);

  return lintAndPrettifyCode(sourceCode);
};

const parseTemplateVariables = (stringMapping = {}) => {
  const stringTransforms = Object.keys(stringMapping).reduce((acc, key) => {
    let accObj = { ...acc };
    let valueOrFunc = stringMapping[key];

    if (isFunction(valueOrFunc)) {
      valueOrFunc = valueOrFunc(accObj);
    } else if (isArray(valueOrFunc)) {
      valueOrFunc = valueOrFunc.reduce((acc, key2) => {
        acc[key2] = key2;

        return acc;
      }, {});
    }
    // else if (isPureObject(valueOrFunc)) {
    //   valueOrFunc = JSON.stringify(valueOrFunc);
    // }

    accObj[key] = valueOrFunc;

    return accObj;
  }, {});

  const transformedParamsToCommaSeparated = Object.entries(
    stringTransforms
  ).reduce((acc, [key, value]) => {
    let accObj = { ...acc };
    let valueString = "";

    if (isString(value)) {
      valueString = value;
    } else if (isPureObject(value)) {
      valueString = Object.entries(value)
        .map(([key, value]) => {
          if (key === value) {
            return key;
          }

          return `${key}: ${value}`;
        })
        .join(",\n");
    }

    accObj[key] = valueString;

    return accObj;
  }, {});

  return transformedParamsToCommaSeparated;
};

const generateFileFromTemplate = async (config, pathToFile, resultPath) => {
  const code = await lintAndPrettifyCodeFromFile(pathToFile);
  const updatedCode = replaceStrings(code, parseTemplateVariables(config));
  const prettifiedCode = prettify(updatedCode);
  console.log(`\n**UPDATED CODE**\n${prettifiedCode}\n**END UPDATED CODE**\n`);

  await createOrUpdateFile(resultPath, prettifiedCode, {
    overwrite: true,
  });
};

const run = (...args) => {
  return generateFileFromTemplate(...args);
};

const operationType = lambdaConfig.operationType;
const isMutation = operationType === "Mutation";
const method =
  (isMutation && `${lambdaConfig.httpMethod?.toLowerCase() || ""}`) || "post";
const type = lambdaConfig.type;
const casedType = camelCase(type);
const fieldName = lambdaConfig.fieldName;
const fieldNameMapping = wrapValuesWithText(allFieldNames, {
  start: "./",
  end: "Lambda",
});
const lambdaMapping = wrapValuesWithRequire(fieldNameMapping);
const urlPath = isFunction(lambdaConfig.urlPath)
  ? lambdaConfig.urlPath("params")
  : lambdaConfig.urlPath;
const imports = convertImports(lambdaConfig.imports);
const params = isFunction(lambdaConfig.params)
  ? lambdaConfig.params("params")
  : convertObjectToString(lambdaConfig.params, "params");
const response = isFunction(lambdaConfig.response)
  ? getFunctionString(lambdaConfig.response)
  : convertObjectToString(lambdaConfig.response, "result");
const testHeaders = convertObject(lambdaConfig.testHeaders);
const testArgs = !isMutation
  ? convertObject(lambdaConfig.testArgs)
  : `{
      input: ${convertObject(lambdaConfig.testArgs)}
    }`;

if (process.argv.length) {
  const basePath = `../../../Macanta/MacantaApp_AWS`;
  const lambdaPath = `${basePath}/${type}-service/${fieldName}Lambda.js`;
  const relativeLambdaPath = `../${type}-service/${fieldName}Lambda.js`;
  const testPath = `${basePath}/tests/${fieldName}-lambda.js`;
  const rootPath = `${basePath}/${type}-service/${casedType}Lambda.js`;
  const apiPath = `rest${urlPath}`;

  const info = getPathInfo(process.argv[1]);

  if (info.fileName.startsWith("convert-js-ast")) {
    const queryPathToFile =
      "../../static_samples/templates/lambdaQuery/template.js";
    const mutationPathToFile =
      "../../static_samples/templates/lambdaMutation/template.js";
    const lambdaPathToFile = !isMutation ? queryPathToFile : mutationPathToFile;
    const testPathToFile =
      "../../static_samples/templates/lambdaTest/template.js";
    const rootPathToFile =
      "../../static_samples/templates/lambdaRoot/template.js";

    syncPromises([
      () =>
        run(
          {
            templateApiPath: apiPath,
            templateImports: imports,
            templateParams: params,
            templateResponse: response,
            ...(isMutation && {
              templateMethod: method,
            }),
          },
          lambdaPathToFile,
          lambdaPath
        ),
      () =>
        run(
          {
            templateHeaders: testHeaders,
            templateArguments: testArgs,
            templateLambdaPath: relativeLambdaPath,
          },
          testPathToFile,
          testPath
        ),
      () =>
        run(
          {
            templateType: casedType,
            templateLambdaMapping: lambdaMapping,
          },
          rootPathToFile,
          rootPath
        ),
    ]);
  }
}

import prettier from "prettier";

export const lint = (code) => {
  const Linter = require("eslint").Linter;

  const linter = new Linter();

  const { fixed, output, messages } = linter.verifyAndFix(code, {
    // root: true,
    env: {
      amd: true,
      node: true,
      "jest/globals": true,
      es6: true,
    },
    plugins: ["import", "unused-imports", "jest"],
    extends: [
      "eslint:recommended",
      "plugin:import/recommended",
      "plugin:jest/recommended",
    ],
    parserOptions: {
      ecmaVersion: 13,
      parser: "@babel/eslint-parser",
      sourceType: "module",
      requireConfigFile: false,
      babelOptions: {
        babelrc: false,
        configFile: false,
      },
    },
    rules: {
      "import/no-unresolved": "off",
      // "unused-imports/no-unused-imports": "warn",
      "no-shadow": "warn",
      "no-prototype-builtins": "off",
      "no-param-reassign": "warn",
      "no-empty": "warn",
      "no-use-before-define": "off",
    },
  });

  // console.log("Linter:", { fixed, messages });

  return output;
};

export const prettify = (code) =>
  prettier.format(code, {
    parser: "babel",
    arrowParens: "always",
    trailingComma: "all",
  });

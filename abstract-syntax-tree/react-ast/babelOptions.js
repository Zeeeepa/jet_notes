export const BABEL_OPTIONS = {
  configFile: false, // disable reading from project root's Babel config
  ast: true,
  retainLines: true,
  parserOpts: {
    sourceType: "module",
    plugins: [
      "jsx",
      "asyncFunctions",
      "classConstructorCall",
      "doExpressions",
      "trailingFunctionCommas",
      "objectRestSpread",
      "decoratorsLegacy",
      "classProperties",
      "exportExtensions",
      "exponentiationOperator",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      "optionalChaining",
      "typescript",
    ],
  },
};

export const BABEL_PLUGINS = [
  "jsx",
  "classProperties",
  [
    "typescript",
    {
      dts: true,
      // disallowAmbiguousJSXLike: true
    },
  ],
];

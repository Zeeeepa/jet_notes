module.exports = {
  env: {
    node: true,
    "jest/globals": true,
    es6: true,
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
};

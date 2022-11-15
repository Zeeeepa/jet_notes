module.exports = {
  root: true,
  env: {
    amd: true,
    node: true,
    "jest/globals": true,
    es6: true,
  },
  ignorePatterns: ["**/*.md"],
  plugins: ["jest"],
  extends: ["plugin:jest/recommended"],
};

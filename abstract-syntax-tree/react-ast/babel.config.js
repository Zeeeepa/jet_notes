module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "6",
          },
        },
      ],
      "@babel/preset-react",
      "@babel/preset-typescript",
    ],
  };
};

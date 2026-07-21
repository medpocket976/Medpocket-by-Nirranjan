module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // React Compiler — automatic memoization for better runtime performance.
      // Requires React 19+. Must come before other plugins.
      "babel-plugin-react-compiler",
    ],
  };
};

const { override, addWebpackResolve, addWebpackPlugin } = require("customize-cra");
const webpack = require("webpack")
module.exports = override(
  addWebpackResolve({
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer"),
      constants: require.resolve("constants-browserify"),
      fs: false,
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
      util: require.resolve("util/"),
      "process/browser": require.resolve("process/browser"),
    },
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  )
);

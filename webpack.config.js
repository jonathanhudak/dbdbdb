const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const PeerDepsExternalsPlugin = require("peer-deps-externals-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  watch: !isProduction,
  mode: isProduction ? "production" : "development",
  entry: {
    index: "./src/index.js",
    ...(isProduction ? {} : { demo: "./src/demo/index.js" })
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname)
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    hot: true,
    port: 9000,
    historyApiFallback: {
      index: "index.html"
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  optimization: {
    minimize: false
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  plugins: [
    ...(isProduction
      ? []
      : [new webpack.HotModuleReplacementPlugin(), new Dotenv()])
  ]
};

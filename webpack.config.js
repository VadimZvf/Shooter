const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  devtool: process.env.NODE_ENV === "development" ? "inline-source-map" : undefined,
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.png$/i,
        use: 'file-loader',
      },
      {
        test: /\.frag$/i,
        use: 'raw-loader',
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "docs"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  devServer: {
    compress: true,
    port: 9000,
  },
};

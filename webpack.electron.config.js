const path = require("path");

module.exports = {
  resolve: {
    alias: {
      ['@']: path.resolve(__dirname, 'src')
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  devtool: "source-map",
  entry: "./main/main.ts",
  target: "electron-main",
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};

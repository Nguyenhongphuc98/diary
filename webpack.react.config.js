const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		mainFields: ["main", "module", "browser"],
	},
	entry: "./src/app.tsx",
	target: "electron-renderer",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
			},
			{
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
		],
	},
	devServer: {
		contentBase: path.join(__dirname, "../dist/renderer"),
		historyApiFallback: true,
		compress: true,
		hot: true,
		port: 4000,
		publicPath: "/",
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "js/[name].js",
	},
	plugins: [new HtmlWebpackPlugin()
		// ,
		// new CopyPlugin({
		//     patterns: [
		// 		{ from: 'src/assets', to: 'dist' },
		//     ]
		// })
	],
};

/**
 * External dependencies
 */
const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );


/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );


const pluginGroups = {
	...defaultConfig,
	entry: {
		"plugin-groups": './src/js/main.js',
	},
	output: {
		path: path.resolve( process.cwd(), 'js' ),
		filename: '[name].js',
		chunkFilename: '[name].js',
	},
	module: {
		...defaultConfig.module,
		rules: [
			// Remove the css/postcss loaders from `@wordpress/scripts` due to version conflicts.
			...defaultConfig.module.rules.filter(
				( rule ) => ! rule.test.toString().match( '.css' )
			),
			{
				test: /\.css$/,
				use: [
					// prettier-ignore
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
				],
			},
		],
	},
	plugins: [
		...defaultConfig.plugins,
		new MiniCssExtractPlugin( {
			filename: '../css/[name].css',
		} )
	],
};

module.exports = [
	pluginGroups
];

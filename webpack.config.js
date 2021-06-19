/**
 * External dependencies
 */
const path = require( 'path' );
//const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );


/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );


const bulkActions = {
	...defaultConfig,
	entry: {
		bulk: './assets/js/src/bulk.js',
	},
	output: {
		path: path.resolve( process.cwd(), 'js' ),
		filename: '[name].js',
		chunkFilename: '[name].js',
	},
};

module.exports = [
	bulkActions
];

import webpack from 'webpack';
import merge from 'webpack-merge';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';

import baseConfig from './webpack.config.base';
import { config } from './gulp/constants/config';

export default merge.smart(baseConfig, {
	entry: {
		index: [
			`./${config.app}/${config.script}/index.js`
		]
	},
	devtool: 'cheap-module-source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		}),
		new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: ['You application is running here http://localhost:9000'],
        notes: ['`rs` を押すとyarnが再度実行されます。']
			},
      onErrors: (severity, errors) => {},
      clearConsole: true
		}),
		new webpack.NamedModulesPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.LoaderOptionsPlugin({ debug: true })
	]
});

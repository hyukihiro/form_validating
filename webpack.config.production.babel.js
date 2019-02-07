import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
const TerserPlugin = require('terser-webpack-plugin');
import baseConfig from './webpack.config.base';
import { config } from './gulp/constants/config';

const scriptsDir = `./${config.app}/${config.script}/`;

export default merge.smart(baseConfig, {
	mode: 'production',
	entry: {
    index: `${scriptsDir}index.js`
	},
	output: {
		path: path.join(__dirname, config.dist, config.assets, config.script)
	},
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        }
      }),
			// new UglifyJsPlugin({
			// 	parallel: true,
			// 	sourceMap: false,
      //   uglifyOptions: {
			// 		compress: {
			// 			drop_console: true
			// 		},
      //     warnings: false,
      //     output: {
      //       comments: false,
      //       beautify: false
			// 		}
			// 	}
			// })
		]
	},
  // optimization,
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
		}),
		new webpack.ProgressPlugin((percentage, msg) => {
			process.stdout.write('progress ' + Math.floor(percentage * 100) + '% ' + msg + '\r');
		})
	]
});

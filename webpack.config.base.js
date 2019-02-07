import path from 'path';
import chalk from 'chalk';
import { config } from './gulp/constants/config';

const isProd = !!(process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev-prod');
const MODE = isProd ? 'production' : 'development';

console.log(
  chalk.cyan(
    `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold.bgCyan(process.env.NODE_ENV)
    )}`
  )
);


const localIdentName = isProd ? '[hash:base64:5]' : '[name]-[local]-[hash:base64:5]';

export default {
  mode: MODE,
  cache: true,
  target: 'web',
  output: {
    path: path.join(__dirname, config.tmp, config.assets, config.script),
    publicPath: `/${config.assets}/${config.script}/`,
    filename: '[name].bundle.js',
    chunkFilename: '[chunkhash].js',
    sourceMapFilename: '[name].map'
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules|bower_components)/,
        include: __dirname,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheDirectory: true
            }
          }
        ]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ]
  },
  resolve: {
    descriptionFiles: ['package.json'],
    enforceExtension: false,
    modules: ['src', 'src/js', 'web_modules', 'node_modules']
  }
}
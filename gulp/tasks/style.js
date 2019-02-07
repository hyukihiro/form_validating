import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import sugarss from 'sugarss';
import postcss from 'gulp-postcss';
import minmax from 'postcss-media-minmax';
import customProperties from 'postcss-custom-properties';
import short from 'postcss-short';
import cssforloop from 'postcss-for';
import cssrandom from 'postcss-random';
import easing from 'postcss-easings';
import apply from 'postcss-apply';
import autoprefixer from 'autoprefixer';
import _import from 'postcss-easy-import';
import stylelint from 'stylelint';
import assets from 'postcss-assets';
import reporter from 'postcss-reporter';
import mixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import browserSync from 'browser-sync';
import doiuse from 'doiuse';
import sprites, { updateRule } from 'postcss-sprites';
import pixrem from 'pixrem';
import csswring from 'csswring';
import mqpacker from 'css-mqpacker';

import { config } from '../constants/config';

const $ = gulpLoadPlugins();
const reload = browserSync.stream;

const browsers = [
  'ie >= 11',
  'ff >= 48',
  'chrome >= 54',
  'safari >= 9',
  'ios >= 8',
  'android >= 4.4',
  'ChromeAndroid >= 52'
];

const appAssets = `${config.app}/${config.assets}/`;
const tmpAssets = `${config.tmp}/${config.assets}/`;
const distAssets = `${config.dist}/${config.assets}/`;

const processors = [
  _import({
    path: ['node_modules'],
    glob: true,
    extension: ['.sss']
  }),
  apply,
  customProperties(),
  mixins,
  simpleVars,
  short,
  require('postcss-nested'),
  easing(),
  minmax(),
  cssforloop,
  cssrandom,
  autoprefixer({ browsers }),
  assets({
    basePath: `${config.app}/`,
    loadPaths: [`${config.image}/`],
    relativeTo: config.app
  }),
  pixrem,
  sprites({
    stylesheetPath: `${appAssets}${config.styles}/`, //出力するcssのパス
    spritePath: `${appAssets}/${config.image}`,   //スプライト画像を出力する先のパス
    basePath: `${config.app}/`,  // urlのベースパス
    relativeTo: config.app,
    retina: true,
    // img/spritesのみスプライトの対象とする
    filterBy(image){
      if(/images\/sprites/.test(image.url)){
        return Promise.resolve();
      }
      return Promise.reject();
    },
    groupBy: function(image) {
      if (image.url.indexOf('@2x') === -1) {
        return Promise.resolve('@1x');
      }
      return Promise.resolve('@2x');
    },
    spritesmith: {
      padding: 10
    },
    hooks: {
      // 出力されるスプライト画像ファイル名を変更する sprite@2xだと同じファイルが量産されるので
      onSaveSpritesheet: function(opts, data) {
        if(data.groups[0] === '@1x'){
          // 通常サイズのスプライト
          return path.join(opts.spritePath, '_sprites.png');
        }else{
          // retinaサイズのスプライト
          return path.join(opts.spritePath, '_sprites@2x.png');
        }
      }
    }
  }),
  mqpacker({ sort: true }),
  // mixins,
  reporter({ clearMessages: true })
];

gulp.task('stylelint', () => {
  return gulp.src([
    `${config.app}/${config.css}/**/*.sss`,
    `!${config.app}/${config.css}/**/_variables.sss`
  ])
    .pipe($.plumber())
    .pipe(postcss([
      stylelint,
      doiuse({
        browsers,
        ignore: ['flexbox', 'css-appearance', 'css-media-resolution'],
        ignoreFiles: ['**/node_modules/**/*.css', '**/_sprite.css']
      }),
      reporter({ clearMessages: true }),
    ], {
      syntax: sugarss
    }), {
      parser: sugarss
    });
});

const targetFiles = [
    `${config.app}/${config.css}/main.sss`
];

gulp.task('styles', ['stylelint'], () => {
  return gulp.src(targetFiles)
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe(postcss(processors, {
        parser: sugarss
      }))
      .pipe($.rename({ extname: '.css' }))
      .pipe($.sourcemaps.write('.'))
      // .pipe(gulp.dest('.tmp/assets/styles'))
      .pipe(gulp.dest(`${tmpAssets}styles`))
      .pipe(reload({match: "**/*.css"}));
});

gulp.task('styles:prod', ['stylelint'], () => {
  processors.push(csswring({
    removeAllComments: true
  }));

  return gulp.src(targetFiles)
      .pipe($.plumber())
      .pipe(postcss(processors, {
        parser: sugarss
      }))
      .pipe($.rename({ extname: '.css' }))
      .pipe(gulp.dest(`${distAssets}styles`));
});

import gulp from 'gulp';
import cached from 'gulp-cached';
import changed from 'gulp-changed';
import gulpLoadPlugins from 'gulp-load-plugins';
import pugLintStylish from 'puglint-stylish';
import browserSync from 'browser-sync';
import chalk from 'chalk';

import { config } from '../constants/config';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// pugのLint
gulp.task('pug:lint', () => {
  gulp.src(`${config.app}/**/*.pug`)
      .pipe($.pugLinter({
        reporter: pugLintStylish
      }))
});

/**
 * pugタスク
 */
gulp.task('pug', ['pug:lint'], () => {
  reload();
});

gulp.task('pug:web', ['pug:lint'], () => {
  gulp.src([
    'app/**/!(_)*.pug'
  ])
  .pipe($.plumber())
  .pipe(changed(config.app, {
    extension: '.html'
  }))
  .pipe($.pug({
    pretty: true,
    cache: true
  }))
  .pipe($.debug({ title: 'pug:web Compiled:' }))
  .pipe(gulp.dest(config.tmp))
  .pipe(reload({ stream: true }));
});

gulp.task('pug:prod', ['pug:lint'], () => {
  console.log(chalk.gray.bgRed.bold('pug:prod--->'));
  gulp.src(`${config.app}/**/!(_)*.pug`)
    .pipe($.plumber())
    .pipe(cached('pug'))
    .pipe($.pug({
      pretty: false,
      cache: false,
      basedir: `${config.app}/`
    }))
    .pipe($.debug({title: 'pug Compiled:'}))
    .pipe(gulp.dest(config.tmp))
});

// ※ gulp js, pugを先に実行しておくこと
gulp.task('html', () => {
  return gulp.src(`${config.tmp}/**/*.html`)
      .pipe($.debug())
      .pipe(gulp.dest(`${config.dist}/`));
});

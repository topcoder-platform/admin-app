'use strict';

var gulp = require('gulp');

var gulpNgConfig = require('gulp-ng-config');

gulp.task('ng-config', function () {
  gulp.src('config.json')
  .pipe(
    gulpNgConfig('app.constants', {
      environment: process.env.BUILD_ENV || 'dev',
      constants: {
        DEV_JWT: process.env.DEV_JWT
      }
  }))
  .pipe(gulp.dest('src/app'))
});

'use strict';

var gulp = require('gulp');

var gulpNgConfig = require('gulp-ng-config');

gulp.task('ng-config', function () {
  gulp.src('config.json')
  .pipe(
    gulpNgConfig('app.constants', {
      environment: process.env.BUILD_ENV || 'dev',
  }))
  .pipe(gulp.dest('src/app'))
});

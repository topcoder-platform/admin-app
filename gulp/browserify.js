var gulp = require('gulp');

var paths = gulp.paths;

var browserify = require('browserify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var fs = require('fs');

gulp.task('browserify', ['styles'], function () {

  var cssFilePath = paths.tmp + '/serve/app/bundle.css';

  //delete file if exist
  if (fs.existsSync(cssFilePath)) {
    fs.unlinkSync(cssFilePath);
  }

  browserify('./src/index.js')
    .transform(require('browserify-css'), {
      rootDir: 'src',
      onFlush: function (options, done) {
        fs.appendFileSync(cssFilePath, options.data);

        // Do not embed CSS into a JavaScript bundle
        done(null);
      }
    })
    .bundle()
    .on('error', function (e) {
      gutil.log("Browserify Error", gutil.colors.red(e.message))
    })
    //Pass desired output filename to vinyl-source-stream
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.tmp + '/serve/app'));
});
'use strict';

var gulp = require('gulp');

var awspublish = require('gulp-awspublish');

gulp.task('publish', function() {

  // create a new publisher using S3 options
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  var publisher = awspublish.create({
    params: {
      //Bucket: "support-admin.topcoder-dev.com"
      Bucket: process.env.AWS_BUCKET
    }
    //,
    //"accessKeyId": process.env.AWS_KEY,
    //"secretAccessKey": process.env.AWS_SECRET
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=0, no-transform, public'
  };

  return gulp.src(['./dist/**/*','./dist/*'])
    // gzip, Set Content-Encoding headers and add .gz extension
    //.pipe(awspublish.gzip())

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    // remove old files from the destination
    .pipe(publisher.sync())

    // print upload updates to console
    .pipe(awspublish.reporter());
});

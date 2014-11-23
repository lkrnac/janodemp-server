'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var rimraf = require('rimraf');

var paths = {
  dist: 'dist',
  package: [
      './!(node_modules|dist|soapui)/**/*',
      'package.json'
    ]
};

gulp.task('test', function () {

});

gulp.task('clean', function (callback) {
  rimraf('./' + paths.dist, callback);
});

gulp.task('package', ['clean'], function () {
  return gulp.src(paths.package)
    .pipe(plugins.zip('janodemp.zip'))
    .pipe(gulp.dest(paths.dist));
});

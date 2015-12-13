'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var stylish = require('jshint-stylish');

var paths = {
  dist: 'dist',
  server: 'server/**/*.js',
  serverTests: 'server/**/*.js',
  package: [
      './!(node_modules|dist|soapui)/**/*',
      'package.json'
    ]
};

var errorOccured = false;
/**
 * This task is here to exit from process with error code.
 * This way CI server knows that process failed.
 * It is needed because gulp-plumber forces 0 error code
 * even when error occurs.
 */
gulp.task('checkError', ['test'], function () {
  if (errorOccured) {
    console.log('Err, distor occured, exitting build process... ');
    process.exit(1);
  }
});

/**
 * Logs error into variable
 */
var errorHandler = function () {
  console.log('Error occured... ');
  errorOccured = true;
};

gulp.task('build', function () {
  gulp.src([paths.server, paths.serverTests])
    .pipe(plugins.plumber({
      errorHandler: errorHandler
    }))
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('test', ['build'], function () {

});

gulp.task('watch', function () {
  gulp.watch([paths.server, paths.serverTests], ['test']);
});

gulp.task('clean', function (callback) {
  rimraf('./' + paths.dist, callback);
});

gulp.task('package', ['clean'], function () {
  return gulp.src(paths.package)
    .pipe(plugins.zip('janodemp.zip'))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('checkError', ['test'], function () {
  if (errorOccured) {
    console.log('Error occured, exitting build process... ');
    process.exit(1);
  }
});

gulp.task('default', ['test', 'checkError']);

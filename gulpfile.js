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

gulp.task('build', function () {
  gulp.src([paths.server, paths.serverTests])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('test', ['build'], function () {

});

gulp.task('clean', function (callback) {
  rimraf('./' + paths.dist, callback);
});

gulp.task('package', ['clean'], function () {
  return gulp.src(paths.package)
    .pipe(plugins.zip('janodemp.zip'))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['test']);

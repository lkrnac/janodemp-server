"use strict";

var gulp = require("gulp");
var eslint = require("gulp-eslint");
var plumber = require("gulp-plumber");
var mocha = require("gulp-mocha");

var paths = {
  dist: "dist",
  server: "server/**/*.js",
  common: "common/**/*.js",
  serverTests: "test/**/*.js",
  package: [
    "./!(node_modules|dist)/**/*",
    "package.json"
  ]
};

var errorOccured = false;

/**
 * This task is here to exit from process with error code.
 * This way CI server knows that process failed.
 * It is needed because gulp-plumber forces 0 error code
 * even when error occurs.
 */
gulp.task("checkError", ["test"], function () {
  if (errorOccured) {
    console.log("Err, distor occured, exitting build process... "); //eslint-disable-line no-console
    process.exit(1); //eslint-disable-line no-process-exit
  }
});

/**
 * Logs error into variable
 * @returns {void}
 */
var errorHandler = function () {
  console.log("Error occured... "); //eslint-disable-line no-console
  errorOccured = true;
};

gulp.task("lint", function () {
  gulp.src([paths.common, paths.server, paths.serverTests])
    .pipe(plumber({
      errorHandler: errorHandler
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("test", function () {
  gulp.src(paths.serverTests)
    .pipe(plumber({
      errorHandler: errorHandler
    }))
    .pipe(mocha());
});

gulp.task("watch", function () {
  gulp.watch([paths.server, paths.serverTests], ["test"]);
});

gulp.task("default", ["lint", "test", "checkError"]);

"use strict";

var gulp = require("gulp");
var eslint = require("gulp-eslint");
var plumber = require("gulp-plumber");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var coveralls = require("gulp-coveralls");

var path = {
  dist: "dist",
  server: "server/**/*.js",
  common: "common/**/*.js",
  gulpfile: "gulpfile.js",
  serverTests: "test/**/*.js",
  package: [
    "./!(node_modules|dist)/**/*",
    "package.json"
  ]
};

var errorOccured = false;

/**
 * Logs error into variable
 * @returns {void}
 */
var errorHandler = function () {
  console.log("Error occured... "); //eslint-disable-line no-console
  errorOccured = true;
};

gulp.task("lint", function () {
  gulp.src([path.common, path.server, path.gulpfile, path.serverTests])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("pre-test", function () {
  return gulp.src([path.common, path.server, "!server/server.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task("test", ["pre-test"], function (cb) {
  gulp.src(path.serverTests)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(mocha())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          statements: 90,
          branches: 50,
          functions: 95,
          lines: 90
        }
      }
    }))
    .on("end", cb);
});

gulp.task("watch", function () {
  gulp.watch([path.server, path.serverTests], ["test"]);
});

gulp.task("coveralls", ["test", "checkError"], function () {
  return gulp.src("./coverage/lcov.info")
    .pipe(coveralls());
});
/**
 * This task is here to exit from process with error code.
 * This way CI server knows that process failed.
 * It is needed because gulp-plumber forces 0 error code
 * even when error occurs.
 */
gulp.task("checkError", ["test"], function () {
  if (errorOccured === true) {
    console.log("Error occurred, exiting build process... "); //eslint-disable-line no-console
    process.exit(1); //eslint-disable-line no-process-exit
  }
});

gulp.task("default", ["lint", "test", "checkError"]);
gulp.task("build", ["default", "coveralls"]);

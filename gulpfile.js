"use strict";

var gulp = require("gulp");
var rimraf = require("rimraf");
var eslint = require("gulp-eslint");
var zip = require("gulp-zip");
var plumber = require("gulp-plumber");

var paths = {
  dist: "dist",
  server: "server/**/*.js",
  serverTests: "server/**/*.js",
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
    //noinspection Eslint
    console.log("Err, distor occured, exitting build process... ");
    //noinspection Eslint
    process.exit(1);
  }
});

/**
 * Logs error into variable
 * @returns {void}
 */
var errorHandler = function () {
  //noinspection Eslint
  console.log("Error occured... ");
  errorOccured = true;
};

gulp.task("build", function () {
  gulp.src([paths.server, paths.serverTests])
    .pipe(plumber({
      errorHandler: errorHandler
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("test", ["build"], function () {

});

gulp.task("watch", function () {
  gulp.watch([paths.server, paths.serverTests], ["test"]);
});

gulp.task("clean", function (callback) {
  rimraf("./" + paths.dist, callback);
});

gulp.task("package", ["clean"], function () {
  return gulp.src(paths.package)
    .pipe(zip("janodemp.zip"))
    .pipe(gulp.dest(paths.dist));
});

gulp.task("checkError", ["test"], function () {
  if (errorOccured) {
    //noinspection Eslint
    console.log("Error occured, exitting build process... ");
    //noinspection Eslint
    process.exit(1);
  }
});

gulp.task("default", ["test", "checkError"]);

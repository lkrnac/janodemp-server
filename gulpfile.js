"use strict";

var gulp = require("gulp");
var eslint = require("gulp-eslint");
var plumber = require("gulp-plumber");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var coveralls = require("gulp-coveralls");
var fsExtra = require("fs-extra");
var path = require("path");

var srcPath = {
  dist: "dist",
  server: "server/**/*.js",
  common: "common/**/*.js",
  commonModels: "common/**/*.json",
  serverModels: "server/**/*.json",
  gulpfile: "gulpfile.js",
  serverTests: "test/**/*.spec.js",
  serverBootTests: "test/**/*.boot.js",
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
  gulp.src([
    srcPath.common,
    srcPath.server,
    srcPath.gulpfile,
    srcPath.serverTests,
    srcPath.serverBootTests
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("pre-test", function () {
  return gulp.src([srcPath.common, srcPath.server, "!server/server.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task("test-boot", ["pre-test"], function (cb) {
  var dbPath = path.resolve(__dirname, "db.json");
  var dbPathBckp = path.resolve(__dirname, "db.json.bckp");

  var restoreBackup = function () {
    fsExtra.removeSync(dbPath);
    fsExtra.move(dbPathBckp, dbPath, function () {
      cb(); //execute callback this way to ignore if DB files are missing
    });
  };

  fsExtra.move(dbPath, dbPathBckp, function () {
    gulp.src(srcPath.serverBootTests)
      .pipe(plumber({ errorHandler: errorHandler }))
      .pipe(mocha())
      .on("end", restoreBackup);
  });
});

gulp.task("test", ["test-boot"], function (cb) {
  gulp.src(srcPath.serverTests)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(mocha())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          statements: 90,
          branches: 66,
          functions: 100,
          lines: 90
        }
      }
    }))
    .on("end", cb);
});

gulp.task("watch", function () {
  gulp.watch([
    srcPath.server,
    srcPath.serverTests,
    srcPath.serverModels,
    srcPath.common,
    srcPath.commonModels
  ], ["test"]);
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

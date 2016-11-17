"use strict";

const gulp = require("gulp");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const mocha = require("gulp-mocha");
const istanbul = require("gulp-istanbul");
const coveralls = require("gulp-coveralls");
const fsExtra = require("fs-extra");
const path = require("path");

const srcPath = {
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

var errorOccurred = false; //eslint-disable-line no-var

/**
 * Logs error into variable
 * @returns {void}
 */
const watchErrorHandler = () => {
  console.log("Error occurred... "); //eslint-disable-line no-console
  errorOccurred = true;
};

gulp.task("lint", () => {
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

gulp.task("pre-test", () => {
  return gulp.src([srcPath.common, srcPath.server, "!server/server.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});


gulp.task("test-boot", ["pre-test"], (cb) => {
  const dbPath = path.resolve(__dirname, "db.json");
  const dbPathBckp = path.resolve(__dirname, "db.json.bckp");
  console.log(`db file path: ${dbPath}`); //eslint-disable-line no-console
  console.log(`db file backup: ${dbPathBckp}`); //eslint-disable-line no-console

  const restoreBackup = function () {
    fsExtra.removeSync(dbPath);
    fsExtra.move(dbPathBckp, dbPath, (error) => {
      console.log(`Error while retrieving from backup: ${error}`); //eslint-disable-line no-console
      cb(); //execute callback this way to ignore if files is missing
    });
  };

  fsExtra.move(dbPath, dbPathBckp, (error) => {
    console.log(`Error while while backing up: ${error}`); //eslint-disable-line no-console
    gulp.src(srcPath.serverBootTests)
      .pipe(plumber({ errorHandler: watchErrorHandler }))
      .pipe(mocha())
      .on("end", restoreBackup);
  });
});

gulp.task("test", ["test-boot"], (cb) => {
  gulp.src(srcPath.serverTests)
    .pipe(plumber({ errorHandler: watchErrorHandler }))
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

gulp.task("watch", () => {
  gulp.watch([
    srcPath.server,
    srcPath.serverTests,
    srcPath.serverModels,
    srcPath.common,
    srcPath.commonModels
  ], ["test"]);
});

gulp.task("coveralls", ["test", "checkError"], () => {
  return gulp.src("./coverage/lcov.info")
    .pipe(coveralls());
});

/**
 * This task is here to exit from process with error code.
 * This way CI server knows that process failed.
 * It is needed because gulp-plumber forces 0 error code
 * even when error occurs.
 *
 * More info: https://lkrnac.net/blog/2014/10/watch-file-changes-propagate-errors-gulp
 */
gulp.task("checkError", ["test"], () => {
  if (errorOccurred === true) {
    console.log("Error occurred, exiting build process... "); //eslint-disable-line no-console
    process.exit(1); //eslint-disable-line no-process-exit
  }
});

gulp.task("default", ["lint", "test", "checkError"]);
gulp.task("build", ["default", "coveralls"]);

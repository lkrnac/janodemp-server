const gulp = require("gulp");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const mocha = require("gulp-mocha");
const istanbul = require("gulp-istanbul");
const fsExtra = require("fs-extra");
const fs = require("fs");
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
  const dbPath = path.resolve(__dirname, "../db.json");
  const dbPathBckp = path.resolve(__dirname, "../db.json.bckp");

  const restoreBackup = () => {
    fs.stat(dbPathBckp, (err, stats) => {
      if (stats.isFile()) {
        fsExtra.removeSync(dbPath);
        fsExtra.move(dbPathBckp, dbPath, cb);
      } else {
        return cb();
      }
    });
  };

  fsExtra.move(dbPath, dbPathBckp, () => {
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

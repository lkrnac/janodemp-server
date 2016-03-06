const gulp = require("gulp");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const mocha = require("gulp-mocha");
const istanbul = require("gulp-istanbul");
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");

const gulpfileError = require("./gulpfile-error");

const srcPath = {
  common: "common/**/*.js",
  commonModels: "common/**/*.json",
  server: "server/**/*.js",
  serverModels: "server/**/*.json",
  serverTests: "test-server/**/*.spec.js",
  serverBootTests: "test-server/**/*.boot.js",
  gulpfileMain: "gulpfile.js",
  gulpfiles: "gulp/**/*.js"
};

gulp.task("lint-server", () => {
  gulp.src([
    srcPath.common,
    srcPath.server,
    srcPath.gulpfileMain,
    srcPath.gulpfiles,
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


gulp.task("test-server-boot", ["pre-test"], (cb) => {
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
      .pipe(plumber({ errorHandler: gulpfileError.watchErrorHandler }))
      .pipe(mocha())
      .on("end", restoreBackup);
  });
});

gulp.task("test-server", ["test-server-boot"], (cb) => {
  gulp.src(srcPath.serverTests)
    .pipe(plumber({ errorHandler: gulpfileError.watchErrorHandler }))
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
    srcPath.serverBootTests,
    srcPath.serverModels,
    srcPath.common,
    srcPath.commonModels
  ], ["test-server"]);
});

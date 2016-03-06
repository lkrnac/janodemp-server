const gulp = require("gulp");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const mocha = require("gulp-mocha");
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");

const gulpfileError = require("./gulpfile-error");

const serverPath = {
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
    serverPath.common,
    serverPath.server,
    serverPath.gulpfileMain,
    serverPath.gulpfiles,
    serverPath.serverTests,
    serverPath.serverBootTests
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
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
    gulp.src(serverPath.serverBootTests)
      .pipe(plumber({ errorHandler: gulpfileError.watchErrorHandler }))
      .pipe(mocha())
      .on("end", restoreBackup);
  });
});

gulp.task("test-server", ["test-server-boot"], (cb) => {
  gulp.src(serverPath.serverTests)
    .pipe(plumber({ errorHandler: gulpfileError.watchErrorHandler }))
    .pipe(mocha())
    .on("end", cb);
});

gulp.task("watch", () => {
  gulp.watch([
    serverPath.server,
    serverPath.serverTests,
    serverPath.serverBootTests,
    serverPath.serverModels,
    serverPath.common,
    serverPath.commonModels
  ], ["test-server"]);
});

module.exports.serverPath = serverPath;

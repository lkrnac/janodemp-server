const gulp = require("gulp");
const coveralls = require("gulp-coveralls");
const istanbul = require("gulp-istanbul");

const gulpfileError = require("./gulp/gulpfile-error");

//import also all Gulp tasks from following files
const serverPath = require("./gulp/gulpfile-server").serverPath;

const instrumentedFiles = [serverPath.common, serverPath.server, "!server/server.js"];

gulp.task("pre-test", () => {
  return gulp.src(instrumentedFiles)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task("test", ["test-server"]);

gulp.task("write-coverage", ["test"], (cb) => {
  gulp.src(instrumentedFiles)
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

gulp.task("coveralls", ["write-coverage", "check-error"], () => {
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
gulp.task("check-error", ["test-server"], () => {
  if (gulpfileError.isError()) {
    console.log("Error occurred, exiting build process... "); //eslint-disable-line no-console
    process.exit(1); //eslint-disable-line no-process-exit
  }
});

gulp.task("lint", ["lint-server"]);
gulp.task("default", ["lint", "write-coverage", "check-error"]);
gulp.task("build", ["default", "coveralls"]);

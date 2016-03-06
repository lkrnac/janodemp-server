const gulp = require("gulp");
const coveralls = require("gulp-coveralls");

const gulpfileError = require("./gulp/gulpfile-error");

//import all Gulp tasks from following files
require("./gulp/gulpfile-server");

gulp.task("coveralls", ["test", "check-error"], () => {
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
gulp.task("test", ["test-server"]);
gulp.task("default", ["lint", "test", "check-error"]);
gulp.task("build", ["default", "coveralls"]);

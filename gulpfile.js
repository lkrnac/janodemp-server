const gulp = require("gulp");
const coveralls = require("gulp-coveralls");

require("./gulp/gulpfile-server");

gulp.task("coveralls", ["test", "check-error"], () => {
  return gulp.src("./coverage/lcov.info")
    .pipe(coveralls());
});

gulp.task("lint", ["lint-server"]);
gulp.task("default", ["lint", "test", "check-error"]);
gulp.task("build", ["default", "coveralls"]);

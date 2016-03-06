const gulp = require("gulp");
const coveralls = require("gulp-coveralls");

require("./gulp/gulpfile-server");

gulp.task("coveralls", ["test", "checkError"], () => {
  return gulp.src("./coverage/lcov.info")
    .pipe(coveralls());
});

gulp.task("default", ["lint", "test", "checkError"]);
gulp.task("build", ["default", "coveralls"]);

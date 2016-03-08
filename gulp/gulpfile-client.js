const gulp = require("gulp");
const fsExtra = require("fs-extra");
const path = require("path");
const babel = require("babel-register");
const mocha = require("gulp-mocha");

const clientSources = ["client-src/*.jsx", "client-src/*.js"];
const clientTests = ["test-client/*.js"];

gulp.task("test-client", (cb) => {
  gulp.src(clientTests)
    .pipe(mocha({
      reporter: "spec",
      compilers: { js: babel }
    }))
    .on("end", cb);
});

gulp.task("build-client", () => {
  const clientSource = path.resolve(__dirname, "../client-src/index.html");
  const clientDist = path.resolve(__dirname, "../client/index.html");

  fsExtra.copySync(clientSource, clientDist);
});

module.exports.clientSources = clientSources;

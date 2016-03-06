const gulp = require("gulp");
const fsExtra = require("fs-extra");
const path = require("path");

module.exports.clientSources = [];

gulp.task("buildClient", () => {
  const clientSource = path.resolve(__dirname, "../client-src/index.html");
  const clientDist = path.resolve(__dirname, "../client/index.html");

  fsExtra.copySync(clientSource, clientDist);
});

const app = require("../server/server");

module.exports = (done) => {
  if (app.loaded) {
    app.once("started", done);
    app.start();
  } else {
    app.once("loaded", () => {
      app.once("started", done);
      app.start();
    });
  }
};

"use strict";
/* eslint-disable no-console */

module.exports = function (app) {
  var User = app.models.user;

  User.create([
    {username: "admin", email: "admin@janodemp.net", password: "janodemp-default"}
  ], function (err, users) {
    if (err) {
      throw err;
    }

    console.log("Created users:", users);
  });
};

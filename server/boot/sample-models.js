"use strict";
/* eslint-disable no-console */

var printCreatedUsers = function (err, users) {
  if (err) {
    throw err;
  }

  console.log("Created users:", users);
};

var users = [
  {username: "admin", email: "admin@janodemp.net", password: "janodemp-default"}
];

module.exports = function (app) {
  var User = app.models.user;

  User.exists(1, function (err1, exists) {
    if (err1) {
      throw err1;
    }

    if (!exists) {
      User.create(users, printCreatedUsers);
    }
  });
};

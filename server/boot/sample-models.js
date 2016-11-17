/* eslint-disable no-console */
"use strict";

const printCreatedUsers = (err, users) => {
  if (err) {
    throw err;
  }

  console.log("Created users:", users);
};

const users = [
  {username: "admin", email: "admin@janodemp.net", password: "janodemp-default"}
];

module.exports = (app) => {
  const User = app.models.user;

  User.exists(1, (err1, exists) => {
    if (err1) {
      throw err1;
    }

    if (!exists) {
      User.create(users, printCreatedUsers);
    }
  });
};

/* eslint-disable no-magic-numbers */

var app = require("../../server/server");
var request = require("supertest");
var assert = require("assert");

var json = function (verb, url) {
  return request(app)[verb](url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);
};

describe("/users endpoint", function () {
  before(function (done) {
    require("./../start-server");
    done();
  });

  after(function (done) {
    app.removeAllListeners("started");
    app.removeAllListeners("loaded");
    done();
  });

  it("should not allow access without access token", function (done) {
    json("get", "/api/users")
      .expect(401, done);
  });

  it("should login admin user", function (done) {
    json("post", "/api/users/login")
      .send({
        username: "admin",
        password: "janodemp-default"
      })
      .expect(200, function (error, response) {
        assert(typeof response.body === "object");
        assert(response.body.id, "must have an access token");
        assert.equal(response.body.userId, 1);
        done();
      });
  });
});

describe("Unexpected Usage", function () {
  it("should not crash the server when posting a bad id", function (done) {
    json("post", "/api/users/foobar")
      .send({})
      .expect(404, done);
  });
});

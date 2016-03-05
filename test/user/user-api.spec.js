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

  it("should allow read users after login", function (done) {
    json("post", "/api/users/login")
      .send({
        username: "admin",
        password: "janodemp-default"
      })
      .expect(200, function (error, response) {
        assert(typeof response.body === "object");
        var accessToken = response.body.id;
        assert(accessToken, "must have an access token");
        assert.equal(response.body.userId, 1);

        json("get", "/api/users?access_token=" + accessToken)
          .send()
          .expect(200, function (error2, response2) {
            assert(typeof response2.body === "object");
            assert(response2.body[0].id, 1);
            assert(response2.body[0].username, "admin");
            done();
          });
      });
  });

  it("should create admin user at start if doesn't exist", function (done) {
    json("post", "/api/users/login")
      .send({
        username: "admin",
        password: "janodemp-default"
      })
      .expect(200, function (error, response) {
        assert(typeof response.body === "object");
        var accessToken = response.body.id;
        assert(accessToken, "must have an access token");
        assert.equal(response.body.userId, 1);

        json("get", "/api/users?access_token=" + accessToken)
          .send()
          .expect(200, function (error2, response2) {
            assert(typeof response2.body === "object");
            assert(response2.body[0].id, 1);
            assert(response2.body[0].username, "admin");
            done();
          });
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

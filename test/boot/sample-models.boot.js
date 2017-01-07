/* eslint-disable no-magic-numbers */

const assert = require("assert");
const server = require("../test-utils/server-test-helpter");

describe("Application", () => {
  before(server.start);
  after(server.stop);

  it("should create admin user at start if doesn't exist", (done) => {
    server.json("post", "/api/users/login")
      .send({
        username: "admin",
        password: "janodemp-default"
      })
      .expect(200, (error, response) => {
        assert(typeof response.body === "object");
        const accessToken = response.body.id;
        assert(accessToken, "must have an access token");
        assert.equal(response.body.userId, 1);

        server.json("get", `/api/users?access_token=${accessToken}`)
          .send()
          .expect(200, (error2, response2) => {
            assert(typeof response2.body === "object");
            assert(response2.body[0].id, 1);
            assert(response2.body[0].username, "admin");
            done();
          });
      });
  });
});

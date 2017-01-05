const app = require('../../server/server');
const supertest = require('supertest');
const assert = require('assert');

const request = (verb, url) => supertest(app)[verb](url);

const json = (verb, url) => {
  return request(verb, url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
};

const start = (done) => {
  require('./../start-server');
  done();
};

const stop = (done) => {
  app.removeAllListeners('started');
  app.removeAllListeners('loaded');
  done();
};

/*
{
  "username": "admin",
  "password": "janodemp-default"
}
 */
const authenticated = (action) => {
  json('post', '/api/users/login')
    .send({
      username: 'admin',
      password: 'janodemp-default'
    })
    .expect(200, (error, response) => {
      assert(typeof response.body === 'object');
      const accessToken = response.body.id;
      assert(accessToken, 'must have an access token');
      assert.equal(response.body.userId, 1);

      action(accessToken);
    });
};

exports.json = json;
exports.start = start;
exports.stop = stop;
exports.authenticated = authenticated;
exports.request = request;

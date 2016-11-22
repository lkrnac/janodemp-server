/* eslint-disable no-magic-numbers */

const app = require('../../server/server');
const request = require('supertest');
const assert = require('assert');

const json = (verb, url) => {
  return request(app)[verb](url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
};

describe('/users endpoint', () => {
  before((done) => {
    require('./../start-server');
    done();
  });

  after((done) => {
    app.removeAllListeners('started');
    app.removeAllListeners('loaded');
    done();
  });

  it('should not allow access without access token', (done) => {
    json('get', '/api/users')
      .expect(401, done);
  });

  it('should login admin user', (done) => {
    json('post', '/api/users/login')
      .send({
        username: 'admin',
        password: 'janodemp-default'
      })
      .expect(200, (error, response) => {
        assert(typeof response.body === 'object');
        assert(response.body.id, 'must have an access token');
        assert.equal(response.body.userId, 1);
        done();
      });
  });

  it('should allow read users after login', (done) => {
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

        json('get', `/api/users?access_token=${accessToken}`)
          .send()
          .expect(200, (error2, response2) => {
            assert(typeof response2.body === 'object');
            assert(response2.body[0].id, 1);
            assert(response2.body[0].username, 'admin');
            done();
          });
      });
  });

  it('should create admin user at start if doesn\'t exist', (done) => {
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

        json('get', `/api/users?access_token=${accessToken}`)
          .send()
          .expect(200, (error2, response2) => {
            assert(typeof response2.body === 'object');
            assert(response2.body[0].id, 1);
            assert(response2.body[0].username, 'admin');
            done();
          });
      });
  });

});

describe('Unexpected Usage', () => {
  it('should not crash the server when posting a bad id', (done) => {
    json('post', '/api/users/foobar')
      .send({})
      .expect(404, done);
  });
});

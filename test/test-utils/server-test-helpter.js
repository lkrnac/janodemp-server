const app = require('../../server/server');
const request = require('supertest');

const json = (verb, url) => {
  return request(app)[verb](url)
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

exports.json = json;
exports.start = start;
exports.stop = stop;

/* eslint-disable no-magic-numbers */

const assert = require('assert');
const fs = require('fs');
const crypto = require('crypto');
const server = require('../test-utils/server-test-helpter');

const calculateMd5 = (content) => {
  const hash = crypto.createHash('md5').setEncoding('hex');
  content.pipe(hash);
  hash.end();
  return hash.read();
};

describe('/playlist endpoint', () => {
  before(server.start);
  after(server.stop);

  it('should not allow access without access token', (done) => {
    server.json('get', '/api/playlists')
      .send()
      .expect(401, done);
  });

  it('responds NOT FOUND for non existing track in current user playlist', (done) => {
    server.json('get', '/api/playlists/track/foobar.mp3')
      .send()
      .expect(404, done);
  });

  it('responds with track stream for existing track in current user playlist', (done) => {
    server.authenticated((accessToken) => {
      server.request('get', `/api/playlists/track?access_token=${accessToken}`)
        .buffer(false)
        .parse((body) => {
          const file = fs.createReadStream('playlists/bensound.com-rumble.mp3');
          assert(calculateMd5(body), calculateMd5(file));
        })
        .expect(200, done);
    });
  });
});


"use strict";

const fs = require("fs");

module.exports = function (playlist) {
  playlist.track = (callback) => {
    fs.stat("playlists/bensound.com-rumble.mp3", (err, stats) => {
      const data = fs.createReadStream("playlists/bensound.com-rumble.mp3");
      callback(null, data, "audio/mpeg", stats.size);
    });
  };

  playlist.remoteMethod("track", {
    http: {path: "/track/", verb: "get"},
    returns: [
      {arg: "body", type: "file", root: true},
      {arg: "Content-Type", type: "string", http: { target: "header" }},
      {arg: "Content-Length", type: "string", http: { target: "header" }}
    ]
  });
};

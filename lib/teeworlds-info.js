'use strict';

var dgram = require('dgram');

var getInfo = function(server, port) {
  var message = new Buffer('FFFFFFFFFFFFFFFFFFFF6769653305', 'hex');

  var client = dgram.createSocket('udp4');
  client.on('message', function(buf) {
    var arr = [], p;

    for (var i = 0, l = buf.length; i < l; i++) {
      if (buf[i] !== 0) continue;
      if (i === 0) {
        p = 1;
        continue; // skip if it's at the start of buffer
      }
      arr.push(buf.slice(p, i).toString());
      p = i + 1;
    }

    console.log(arr);

    client.close();
  });
  client.send(message, 0, message.length, port, server);
};

module.exports = {
  getInfo: getInfo,
};

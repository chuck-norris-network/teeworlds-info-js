'use strict';

var dgram = require('dgram');
var Promise = require('bluebird');

var parseResponse = function(response) {
  var parts = [];

  var previous = 1;
  for (var i = 0; i < response.length; i++) {
    if (response[i] !== 0x00) continue; // split by 0x00

    parts.push(response.slice(previous, i).toString());
    previous = i + 1;
  }
  parts = parts.slice(1, 10);

  return {
    version: parts[0],
    name: parts[1],
    map: parts[2],
    type: parts[3],
    players: parseInt(parts[5]),
    maxPlayers: parseInt(parts[6]),
    spectators: parseInt(parts[7]) - parseInt(parts[5]),
  };
};

var getInfo = function(host, port) {
  return new Promise(function(resolve, reject) {
    var request = new Buffer('FFFFFFFFFFFFFFFFFFFF6769653305', 'hex');

    var client = dgram.createSocket('udp4');

    var timeout = setTimeout(function() {
      client.close();
      reject(new Error('Timeout'));
    }, 30000);

    client.on('message', function(response) {
      clearTimeout(timeout);
      client.close();
      resolve(parseResponse(response));
    });

    client.on('error', reject);

    client.send(request, 0, request.length, port, host);
  });
};

module.exports = {
  getInfo: getInfo,
};

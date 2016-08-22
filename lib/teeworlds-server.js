const dgram = require('dgram');
const bsplit = require('buffer-split');
const protocol = require('./protocol.js');
const { chunk } = require('./utils');

class TeeworldsServer {

  /**
   * Teeworlds server class constructor
   *
   * @param  {String} host Server FQDN or IP
   * @param  {Integer} port Server port
   */
  constructor(host, port) {
    if (!host) throw new Error('Undefined host');
    if (!port) throw new Error('Undefined port');

    this.host = host;
    this.port = parseInt(port);
  }

  /**
   * Get server information
   *
   * @param  {Integer} timeout Timeout
   * @return {Object}          Server information
   */
  getInfo(timeout = 30) {
    return this.sendRequest(timeout);
  }

  /**
   * Ping server
   *
   * @param  {Integer} timeout Timeout
   * @return {Integer}         Ping time in milliseconds
   */
  ping(timeout = 30) {
    const start = new Date();
    return this.sendRequest(timeout).then(() => {
      const end = new Date();
      return end - start;
    });
  }

  sendRequest(timeout = 30) {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');

      client.on('message', (response) => {
        client.close();
        client.unref();
        resolve(this.parseResponse(response));
      });

      client.on('error', (err) => {
        client.close();
        client.unref();
        reject(err);
      });

      const timer = setTimeout(() => {
        client.close();
        client.unref();
        const err = new Error('Timeout');
        reject(err);
      }, timeout * 1000);

      client.on('close', () => {
        clearTimeout(timer);
      });

      client.send(protocol.SERVERBROWSE_GETINFO, this.port, this.host);
    });
  }

  parseResponse(response) {
    const data = bsplit(response, protocol.DELIM).map((buffer) => buffer.toString());

    let players = chunk(data.slice(10, -1), 5).map((player) => {
      return {
        name: player[0],
        clan: player[1] == '' ? null : player[1],
        flag: protocol.FLAGS[player[2]] ? protocol.FLAGS[player[2]] : null,
        score: parseInt(player[3]),
        spectator: parseInt(player[4]) == 0 ? true : false,
      };
    });

    return {
      host: this.host,
      port: this.port,
      version: data[1],
      name: data[2],
      map: data[3],
      gametype: data[4],
      online: parseInt(data[6]),
      maxOnline: parseInt(data[7]),
      spectators: parseInt(data[8]) - parseInt(data[6]),
      players: players,
    };
  }

}

module.exports = TeeworldsServer;

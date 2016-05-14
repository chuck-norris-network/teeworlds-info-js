const dgram = require('dgram');
const bsplit = require('buffer-split');

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

      const request = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x67, 0x69, 0x65, 0x33, 0x67]);

      client.send(request, this.port, this.host);
    });
  }

  parseResponse(response) {
    const delimeter = Buffer.from([0x00]);
    const data = bsplit(response, delimeter).map((buffer) => buffer.toString());

    return {
      version: data[1],
      name: data[2],
      map: data[3],
      gametype: data[4],
      players: parseInt(data[6]),
      maxPlayers: parseInt(data[7]),
      spectators: parseInt(data[8]) - parseInt(data[6]),
    };
  }

}

module.exports = TeeworldsServer;

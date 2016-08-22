const TeeworldsConnection = require('./teeworlds-connection');
const protocol = require('./protocol');
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

    this.client = new TeeworldsConnection(host, parseInt(port));
  }

  /**
   * Get server information
   *
   * @param  {Integer} timeout Timeout
   * @return {Object}          Server information
   */
  getInfo(timeout = 30000) {
    return this.client.request(protocol.SERVERBROWSE_GETINFO, protocol.SERVERBROWSE_INFO, timeout).then((response) => {
      return this.parseResponse(response);
    });
  }

  /**
   * Ping server
   *
   * @param  {Integer} timeout Timeout
   * @return {Integer}         Ping time in milliseconds
   */
  ping(timeout = 30000) {
    const start = new Date();
    return this.getInfo(timeout).then(() => {
      const end = new Date();
      return end - start;
    });
  }

  parseResponse(response) {
    const data = response.map((buffer) => buffer.toString());

    let players = chunk(data.slice(9, -1), 5).map((player) => {
      return {
        name: player[0],
        clan: player[1] == '' ? null : player[1],
        flag: protocol.FLAGS[player[2]] ? protocol.FLAGS[player[2]] : null,
        score: parseInt(player[3]),
        spectator: parseInt(player[4]) == 0 ? true : false,
      };
    });

    return {
      host: this.client.host,
      port: this.client.port,
      version: data[0],
      name: data[1],
      map: data[2],
      gametype: data[3],
      online: parseInt(data[5]),
      maxOnline: parseInt(data[6]),
      spectators: parseInt(data[7]) - parseInt(data[5]),
      players: players,
    };
  }

}

module.exports = TeeworldsServer;

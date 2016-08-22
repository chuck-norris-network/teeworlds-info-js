const TeeworldsConnection = require('./teeworlds-connection');
const protocol = require('./protocol');
const { inetNtop } = require('./utils');

class TeeworldsMaster {

  constructor(host, port = 8300) {
    if (!host) throw new Error('Undefined host');
    if (!port) throw new Error('Undefined port');

    this.client = new TeeworldsConnection(host, parseInt(port));
  }

  listServers(timeout = 30000) {
    return this.client.request(protocol.SERVERBROWSE_GETLIST, protocol.SERVERBROWSE_LIST, timeout).then((response) => {
      return this.parseResponse(response);
    });
  }

  parseResponse(response) {
    return response.map((buf) => {
      return {
        host: inetNtop(buf.slice(2, -2)),
        port: buf.slice(-2).readUInt16BE(),
      };
    });
  }

}

module.exports = TeeworldsMaster;

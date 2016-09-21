const dgram = require('dgram');
const protocol = require('./protocol');
const { bsplit } = require('./utils');

class TeeworldsConnection {

  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  request(packet, check, timeout) {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');

      client.on('message', (response) => {
        client.close();
        client.unref();

        const empty = Buffer.from([]);
        const data = bsplit(response, protocol.DELIM, false).filter(buf => !buf.equals(empty));

        if (!data.shift().equals(check))
          return reject(new Error('Wrong response format'));

        resolve(data);
      });

      client.on('error', (err) => {
        client.close();
        client.unref();
        reject(err);
      });

      const timer = setTimeout(() => {
        client.close();
        client.unref();
        reject(new Error('Timeout'));
      }, timeout);

      client.on('close', () => {
        clearTimeout(timer);
      });

      client.send(packet, this.port, this.host);
    });
  }

}

module.exports = TeeworldsConnection;

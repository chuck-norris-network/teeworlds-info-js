# teeworlds-info-js
Teeworlds servers info gathering.

## Usage example
```js
const TeeworldsServer = require('teeworlds-info');

server = new TeeworldsServer('localhost', 8303);

server.getInfo().then((info) => {
  console.log('%s [%s/%s]', info.name, info.players, info.maxPlayers);
});

server.ping().then((ping) => {
  console.log('%sms', ping);
});
```

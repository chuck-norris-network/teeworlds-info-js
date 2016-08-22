# teeworlds-info-js
Teeworlds servers info gathering.

## Usage example

#### Fetch one server info

```js
const { TeeworldsServer } = require('teeworlds-info');

let server = new TeeworldsServer('localhost', 8303);

server.getInfo().then((info) => {
  console.log('%s [%s/%s]', info.name, info.online, info.maxPlayers);
});

server.ping().then((ping) => {
  console.log('%sms', ping);
});
```

#### Fetch list of servers from masters

```js
const { TeeworldsMaster } = require('teeworlds-info');

let master1 = new TeeworldsMaster('master1.teeworlds.com');
let master2 = new TeeworldsMaster('master2.teeworlds.com');
let master3 = new TeeworldsMaster('master3.teeworlds.com');
let master4 = new TeeworldsMaster('master4.teeworlds.com');

Promise.all([
  master1.listServers(),
  master2.listServers(),
  master3.listServers(),
  master4.listServers(),
]).then((results) => {
  results.reduce((a, b) => {
    return a.concat(b);
  }).forEach((server) => {
    console.log('%s:%s', server.host, server.port);
  });
});
```

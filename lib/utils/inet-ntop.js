module.exports = function inetNtop(buf) {
  if (buf.length === 4) { // IPv4
    return [
      buf[0],
      buf[1],
      buf[2],
      buf[3],
    ].join('.');
  } else if (buf.length === 16) { // IPv6 not supported
    return null;
  } else {
    return null;
  }
};

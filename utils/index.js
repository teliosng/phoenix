'use strict';

const Crypto = require('crypto');
const Url = require('url');

class Utils {

  static classify(str) {
    return str
      .split(/[-_\s]+/g)
      .reduce((acc, part) => {
        acc = acc + part[0].toUpperCase() + part.substr(1);
        return acc;
      }, '');
  }

  static generateToken(length) {
    return new Promise((resolve, reject) => {
      Crypto.randomBytes(length, (err, buffer) => {
        if (err) return reject(err);
        return resolve(buffer.toString('hex'));
      });
    });
  }

  static toRegexpString(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  static domainMatches(url, domain) {
    return Url.parse(url).hostname === Url.parse(domain).hostname;
  }

}

module.exports = Utils;
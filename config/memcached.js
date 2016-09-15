'use strict';

const env = process.env;

module.exports = {

  default: {
    hosts: [env.MEMCACHED_HOST || '127.0.0.1:11211']
  }

};
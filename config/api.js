'use strict';

module.exports = {
  default: {
    name: 'MediaBucket API',
    port: process.env.PORT || 8888,
    loggingLevel: 'silly'
  },

  development: {
    loggingLevel: 'info'
  },

  test: {
    loggingLevel: 'error'
  }
};
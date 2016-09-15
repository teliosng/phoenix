'use strict';

module.exports = {
  default: {
    name: 'Example app',
    port: process.env.PORT || 6789,
    loggingLevel: 'silly'
  },

  development: {
    loggingLevel: 'info'
  },

  test: {
    loggingLevel: 'error'
  }
};
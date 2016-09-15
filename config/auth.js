'use strict';

const Time = require('../constants/time');

module.exports = {

  default: {
    name: 'MediaBucket Auth Center',
    maxAge: 0,
    port: process.env.PORT || 8666,
    loggingLevel: 'silly'
  },

  production: {
    maxAge: Time.WEEK,
    domain: 'mediabucket.io'
  },

  staging: {
    maxAge: 2 * Time.WEEK,
    domain: 'mdbk.io'
  },

  development: {
    maxAge: false,
    loggingLevel: 'info',
    domain: null
  },

  test: {
    maxAge: false,
    loggingLevel: 'error',
    domain: null
  }

};
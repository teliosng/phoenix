'use strict';

/* eslint-disable global-require */

const Connectors = {
  Account: require('./account'),
  Client: require('./client'),
  Container: require('./container'),
  Bucket: require('./bucket'),
  AuthorizationCode: require('./authorization-code'),
  AccessToken: require('./access-token')
};

/* eslint-enable global-require */

module.exports = Connectors;
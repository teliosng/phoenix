'use strict';

const DB = require('../modules/db');

const Models = {
  Account: DB.import('./account'),
  Client: DB.import('./client'),
  Attribute: DB.import('./attribute'),
  AuthorizationCode: DB.import('./authorization-code'),
  Bucket: DB.import('./bucket'),
  Container: DB.import('./container'),
  File: DB.import('./file'),
  MasterMedia: DB.import('./master-media'),
  UserMedia: DB.import('./user-media'),
  Media: DB.import('./media'),
  AccessToken: DB.import('./access-token')
};

module.exports = Models;
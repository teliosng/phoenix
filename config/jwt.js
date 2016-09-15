'use strict';

const FS = require('fs');
const Path = require('path');

const SmartEnum = require('../classes/smart-enum');
const Environments = require('../constants/environments');

const Secrets = new SmartEnum(Environments.keys.reduce((acc, env) => {
  acc[env] = FS.readFileSync(Path.resolve(__dirname, `../secrets/jwt-${Environments[env]}`));
  return acc;
}, {}));

module.exports = {

  production: {
    secret: Secrets.PRODUCTION
  },

  stating: {
    secret: Secrets.STAGING
  },

  development: {
    secret: Secrets.DEVELOPMENT
  },

  test: {
    secret: Secrets.TEST
  }

};
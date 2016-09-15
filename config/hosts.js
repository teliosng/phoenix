'use strict';

const Configurator = require('../modules/configurator');

const apiConfig = Configurator.get('api');
const authConfig = Configurator.get('auth');
const exampleConfig = Configurator.get('example');

module.exports = {

  development: {
    API: `http://localhost:${apiConfig.port}`,
    AUTH: `http://localhost:${authConfig.port}`,
    WEBAPP: `http://localhost:${3000}`,
    EXAMPLE: `http://localhost:${exampleConfig.port}`
  },

  staging: {
    API: `http://api.mdbk.io`,
    AUTH: `http://auth.mdbk.io`,
    WEBAPP: `http://app.mdbk.io`,
    EXAMPLE: `http://example-staging.us-west-1.elasticbeanstalk.com`
  }

};
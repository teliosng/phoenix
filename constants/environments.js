'use strict';

const SmartEnum = require('../classes/smart-enum');

const Environments = new SmartEnum({
  TEST: 'test',
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
});

module.exports = Environments;
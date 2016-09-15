'use strict';

const SmartEnum = require('../classes/smart-enum');

const Apps = new SmartEnum({
  API: 'api',
  AUTH: 'auth',
  WEB_APP: 'web-app',
  EXAMPLE: 'example'
});

module.exports = Apps;
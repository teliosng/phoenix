'use strict';

const SmartEnum = require('../classes/smart-enum');

const Roles = new SmartEnum({
  USER: 'user',
  DEVELOPER: 'developer',
  SYSTEM: 'system',
  ADMIN: 'admin'
});

module.exports = Roles;
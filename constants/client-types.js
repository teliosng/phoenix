'use strict';

const SmartEnum = require('../classes/smart-enum');

const ClientTypes = new SmartEnum({
  PUBLIC: 'public',
  PRIVATE: 'private'
});

module.exports = ClientTypes;
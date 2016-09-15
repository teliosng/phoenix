'use strict';

const SmartEnum = require('../classes/smart-enum');

const ClientStates = new SmartEnum({
  SANDBOX: 'sandbox',
  LIVE: 'live'
});

module.exports = ClientStates;
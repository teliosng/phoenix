'use strict';

const ConfigMan = require('configman');

const ENV = require('../constants/env');

const Configurator = new ConfigMan({
  env: ENV
});


module.exports = Configurator;
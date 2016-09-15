'use strict';

const Configurator = require('../modules/configurator');
const ENV = require('../constants/env');
const APP_NAME = require('../constants/app-name');

const Config = {};

Config[ENV] = {
  host: Configurator.get('hosts')[APP_NAME.toUpperCase()],
  loggingLevel: Configurator.get(APP_NAME).loggingLevel
};

module.exports = Config;
'use strict';

const Winston = require('winston');

const Configurator = require('./configurator');

const LEVEL = Configurator.get('me', 'loggingLevel');

const Logger = scope => {
  return new Winston.Logger({
    level: LEVEL,
    transports: [
      new (Winston.transports.Console)({
        timestamp: true,
        colorize: true,
        label: scope
      })
    ]
  });
};

module.exports = Logger;
'use strict';

/* eslint-disable global-require */

const Configurator = require('../../modules/configurator');

const Constants = {
  ENV: require('../../constants/env'),
  Environments: require('../../constants/environments').toJSON(),
  Roles: require('../../constants/roles').toJSON(),
  MediaTypes: require('../../constants/media-types').toJSON(),
  Host: Configurator.get('hosts')
};

module.exports = app => {

  app.get('/v1/constants', (req, res) => {
    return res.json({ data: Constants });
  });

};

/* eslint-enable global-require */
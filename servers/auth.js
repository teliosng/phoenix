'use strict';

const Apps = require('../constants/apps');
process.env.APP_NAME = Apps.AUTH;

const http = require('http');

const app = require('../apps/auth');
const Logger = require('../modules/logger')('server');
const Configurator = require('../modules/configurator');

const PORT = Configurator.get('auth').port;


const server = http.createServer(app);


server.listen(PORT, err => {
  if (err) throw err;
  Logger.info(`${Configurator.get('auth').name} listening on port ${PORT}`);
});

module.exports = server;


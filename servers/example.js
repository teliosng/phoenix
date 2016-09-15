'use strict';

const Apps = require('../constants/apps');
process.env.APP_NAME = Apps.EXAMPLE;

const http = require('http');

const app = require('../apps/example');
const Logger = require('../modules/logger')('server');
const Configurator = require('../modules/configurator');

const PORT = Configurator.get('example').port;


const server = http.createServer(app);


server.listen(PORT, err => {
  if (err) throw err;
  Logger.info(`${Configurator.get('example').name} listening on port ${PORT}`);
});

module.exports = server;


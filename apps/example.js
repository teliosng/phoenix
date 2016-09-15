'use strict';

const Apps = require('../constants/apps');
process.env.APP_NAME = Apps.EXAMPLE;

const express = require('express');
const handlebars = require('express-handlebars');

const errorHandler = require('../middlewares/error-handler');
const requestLogger = require('../middlewares/request-logger');
const notFound = require('../middlewares/404');
const Logger = require('../modules/logger')('example');
const Configurator = require('../modules/configurator');
const Environments = require('../constants/environments');

process.on('uncaughtException', err => {
  Logger.error(err);
  return process.exit(1);
});

process.on('unhandledException', err => {
  Logger.error(err);
  return process.exit(1);
});

const app = express();

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

if (process.env.NODE_ENV !== Environments.TEST) app.use(requestLogger());

require('../routes/example')(app);

app.use(notFound());
app.use(errorHandler({ showStackTrace: Configurator.env !== Environments.PRODUCTION }));

module.exports = app;
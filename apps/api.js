'use strict';

const Apps = require('../constants/apps');
process.env.APP_NAME = Apps.API;

const express = require('express');

const Logger = require('../modules/logger')('api');

process.on('uncaughtException', err => {
  Logger.error(err);
  return process.exit(1);
});

process.on('unhandledException', err => {
  Logger.error(err);
  return process.exit(1);
});

const cors = require('../middlewares/cors');
const session = require('../middlewares/session');
const authenticator = require('../middlewares/authenticator');
const Authenticator = require('../classes/authenticator');
const errorHandler = require('../middlewares/error-handler');
const requestLogger = require('../middlewares/request-logger');
const notFound = require('../middlewares/404');
const Configurator = require('../modules/configurator');
const Environments = require('../constants/environments');
require('../models');


const app = express();

if (process.env.NODE_ENV !== Environments.TEST) app.use(requestLogger());
app.use(cors()); // FIXME this shouldn't be that permissive
app.use(session());

// Authorizations
app.post(/^\/v1\/accounts$/, authenticator({ isPublic: true }));
app.get(/^\/v1\/accounts(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.patch(/^\/v1\/accounts(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.patch(/^\/v1\/accounts\/\d+\/activate-developer-account$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.options(/^\/v1\/accounts(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.delete(/^\/v1\/accounts(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));

app.post(/^\/v1\/clients/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.get(/^\/v1\/clients(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.patch(/^\/v1\/clients(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.options(/^\/v1\/clients(\/\d+)?$/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));
app.delete(/^\/v1\/clients(\/\d+)?$/, authenticator({ modes: Authenticator.Modes.MASTER_PASSWORD }));
app.patch(/\/v1\/clients\/\d+\/regenerate-key/, authenticator({ modes: Authenticator.Profiles.WEB_APP }));

app.post(/^\/v1\/containers$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.get(/^\/v1\/containers(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.patch(/^\/v1\/containers(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.delete(/^\/v1\/containers(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.options(/^\/v1\/containers(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));

app.post(/^\/v1\/buckets/, authenticator({ modes: Authenticator.ALL_MODES }));
app.get(/^\/v1\/buckets(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.patch(/^\/v1\/buckets(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.delete(/^\/v1\/buckets(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.options(/^\/v1\/buckets(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));

app.post(/^\/v1\/files/, authenticator({ modes: Authenticator.ALL_MODES }));
app.get(/^\/v1\/files(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.patch(/^\/v1\/files(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.delete(/^\/v1\/files(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.options(/^\/v1\/files(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));

app.post(/^\/v1\/medias/, authenticator({ modes: Authenticator.ALL_MODES }));
app.get(/^\/v1\/medias(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.patch(/^\/v1\/medias(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.delete(/^\/v1\/medias(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.options(/^\/v1\/medias(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));

app.post(/^\/v1\/attributes/, authenticator({ modes: Authenticator.ALL_MODES }));
app.get(/^\/v1\/attributes(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.patch(/^\/v1\/attributes(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.delete(/^\/v1\/attributes(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));
app.options(/^\/v1\/attributes(\/\d+)?$/, authenticator({ modes: Authenticator.ALL_MODES }));

app.get(/^\/v1\/constants$/, authenticator({ modes: Authenticator.Modes.SESSION }));

app.get(/^\/health$/, authenticator({ isPublic: true }));

// Make sure each route is authenticated or explicitly public
app.use((req, res, next) => {
  if (!req.isAuthenticated && !req.isPublic) return next(new Error(`No authorizations set for url: ${req.originalUrl}`));
  return next();
});

/* eslint-disable global-require */

// Declare routes
require('../routes/health')(app);
require('../routes/v1/constants')(app);

// Declare APIs
const v1 = require('../apis/v1');

v1
  .registerResources({
    accounts: require('../resources/accounts'),
    containers: require('../resources/containers'),
    buckets: require('../resources/buckets'),
    files: require('../resources/files'),
    medias: require('../resources/medias'),
    attributes: require('../resources/attributes'),
    clients: require('../resources/clients')
  })
  .launch(app, { port: Configurator.get('api').port });

/* eslint-enable global-require */

app.use(notFound());
app.use(errorHandler({ showStackTrace: Configurator.env !== Environments.PRODUCTION }));

module.exports = app;
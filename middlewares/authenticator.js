'use strict';

const Restypie = require('restypie');
const Url = require('url');

const Configurator = require('../modules/configurator');
const Authenticator = require('../classes/authenticator');

module.exports = (options = {}) => {

  if (options.isPublic) {
    return (req, res, next) => {
      req.isPublic = true;
      return next();
    };
  }

  const authenticator = new Authenticator(options);

  return (req, res, next) => {
    return authenticator.authenticate(req).then(next).catch(err => {
      if (options.redirectTo || req.accepts('html')) {
        const parsedHost = Url.parse(Configurator.get('me').host || '');

        req.session.returnTo = Url.format({
          protocol: parsedHost.protocol,
          host: parsedHost.host,
          port: parsedHost.port,
          pathname: req.originalUrl || req.url
        });

        return res.redirect(options.redirectTo || Restypie.Url.join(Configurator.get('hosts').AUTH, '/login'));
      }

      return next(err);
    });
  };

};
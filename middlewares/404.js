'use strict';

const Restypie = require('restypie');

module.exports = () => {

  return (req, res, next) => {
    const message = `${req.method.toUpperCase()} ${req.url} could not be found on this server.`;
    return next(new Restypie.RestErrors.NotFound(message));
  };

};
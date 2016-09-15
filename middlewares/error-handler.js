'use strict';

const Restypie = require('restypie');

const Logger = require('../modules/logger')('error-handler');

module.exports = ({ showStackTrace = false } = {}) => {

  return (err, req, res, next) => { // eslint-disable-line max-params
    const statusCode = err.status || err.statusCode || res.statusCode || Restypie.Codes.InternalServerError;
    const trace = showStackTrace && err.stack ? err.stack : undefined;

    statusCode === Restypie.Codes.InternalServerError ? Logger.error(err.stack || err) : Logger.warn(err.message);

    const message = showStackTrace ?
      err.message :
      statusCode === Restypie.Codes.InternalServerError ?
        'Something went wrong. Please try again later.' : // Hide server errors in production
        err.message;

    err = Restypie.RestErrors.fromStatusCode(statusCode, message, err.meta);

    return res.status(statusCode).json({
      error: true,
      message: err.message,
      trace,
      code: err.code,
      meta: err.meta
    });
  };
};
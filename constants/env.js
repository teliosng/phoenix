'use strict';

const Environments = require('./environments');

const DEFAULT_ENV = Environments.DEVELOPMENT;

const ENV = process.env.NODE_ENV || DEFAULT_ENV;

module.exports = ENV;
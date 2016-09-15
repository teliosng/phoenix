'use strict';

const session = require('express-session');
const MemcachedStore = require('connect-memcached')(session);

const ENV = require('../constants/env');
const Configurator = require('../modules/configurator');

module.exports = () => {

  return session({
    secret: `media bucket ${ENV}`,
    resave: true,
    saveUninitialized: true,
    name: Configurator.get('sessions').name,
    store: new MemcachedStore({
      hosts: Configurator.get('memcached').hosts
    })
  });

};
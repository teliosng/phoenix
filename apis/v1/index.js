'use strict';

const Restypie = require('restypie');

const v1 = new Restypie.API({
  path: '/v1',
  routerType: Restypie.RouterTypes.EXPRESS
});

module.exports = v1;
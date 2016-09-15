'use strict';

const Chai = require('chai');
const ChaiSubset = require('chai-subset');

const Environments = require('../constants/environments');

process.env.NODE_ENV = Environments.TEST;
global.expect = Chai.expect;
Chai.use(ChaiSubset);
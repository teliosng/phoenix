'use strict';

const Tool = require('../lib/tool');
const DB = require('../../modules/db');
const Environments = require('../../constants/environments');
const ENV = require('../../constants/env');

class ResetDBTool extends Tool {

  run() {
    if (![Environments.TEST, Environments.DEVELOPMENT].includes(ENV)) {
      return Promise.reject(new Error(`You fool tried to drop database for ${ENV}`));
    }
    return DB.reset();
  }

  static describe(yargs) {
    return yargs;
  }

}


module.exports = ResetDBTool;
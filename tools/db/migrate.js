'use strict';

const Tool = require('../lib/tool');
const umzug = require('../../modules/umzug');

class MigrateDBTool extends Tool {

  run() {
    return umzug.up();
  }

  static describe(yargs) {
    return yargs;
  }
}

module.exports = MigrateDBTool;
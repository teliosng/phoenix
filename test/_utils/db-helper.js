'use strict';

const DB = require('../../modules/db');

class DBHelper {

  static truncate() {
    return DB.truncate().then(() => DB.importSeeds());
  }
}


module.exports = DBHelper;


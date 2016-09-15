'use strict';

const Models = require('../models');
const SequelizeConnector = require('../classes/sequelize-connector');

class BucketConnector extends SequelizeConnector {
  static get model() { return Models.Bucket; }
}


module.exports = BucketConnector;
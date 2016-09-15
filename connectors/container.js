'use strict';

const Models = require('../models');
const SequelizeConnector = require('../classes/sequelize-connector');

class ContainerConnector extends SequelizeConnector {
  static get model() { return Models.Container; }
}


module.exports = ContainerConnector;
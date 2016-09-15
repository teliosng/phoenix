'use strict';

const SequelizeConnector = require('../classes/sequelize-connector');
const Models = require('../models');
const Utils = require('../utils');

const TOKEN_LENGTH = 64;

class AccessTokenConnector extends SequelizeConnector {
  static get model() { return Models.AccessToken; }

  static beforeCreate(object) {
    return Utils.generateToken(TOKEN_LENGTH).then(token => object.set('id', token));
  }
}

module.exports = AccessTokenConnector;
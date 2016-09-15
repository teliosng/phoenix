'use strict';

const Models = require('../models');
const Utils = require('../utils');
const SequelizeConnector = require('../classes/sequelize-connector');

const Time = require('../constants/time');

const IDENTIFIER_LENGTH = 32;
const EXPIRATION_DELAY = 10 * Time.MINUTE;

class AuthorizationCodeConnector extends SequelizeConnector {

  static beforeCreate(object) {
    if (!object.expiresAt) object.set('expiresAt', new Date(Date.now() + EXPIRATION_DELAY));
    return Utils.generateToken(IDENTIFIER_LENGTH).then(id => object.set('id', id));
  }

  static get model() { return Models.AuthorizationCode; }
}

module.exports = AuthorizationCodeConnector;
'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Restypie = require('restypie');

const SequelizeConnector = require('../classes/sequelize-connector');
const Client = require('../models').Client;
const Utils = require('../utils');
const ClientStates = require('../constants/client-states');
const ClientTypes = require('../constants/client-types');

const KEY_LENGTH = 32;
const SECRET_LENGTH = 64;

class ClientConnector extends SequelizeConnector {

  validateForPublication() {
    return this.ensureProperties('type', 'logo', 'desc').then(() => {
      if (this.type === ClientTypes.PUBLIC) {
        if (!this.logo) throw new Restypie.RestErrors.Forbidden('Cannot publish a public app which has no logo.');
        if (!this.desc) throw new Restypie.RestErrors.Forbidden('Cannot publish a public app which has no desc.');
      }
    });
  }

  toPublic() { return _.omit(this.toJSON(), ['key', 'secret']); }

  regenerateKey() {
    return Utils.generateToken(KEY_LENGTH).then(key => {
      return this.set('key', key).save().then(() => this);
    });
  }

  static validate(object) {
    return Promise.try(() => {
      if ((object.isNew || object.isModified('state')) && object.state === ClientStates.LIVE) {
        return object.validateForPublication();
      }
    });
  }

  static beforeCreate(object) {
    return Promise.all([
      Utils.generateToken(SECRET_LENGTH).then(secret => object.set({ secret })),
      Utils.generateToken(KEY_LENGTH).then(key => object.set({ key }))
    ]);
  }

  static get model() { return Client; }

}

module.exports = ClientConnector;
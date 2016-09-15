'use strict';

const _ = require('lodash');
const Restypie = require('restypie');
const BCrypt = require('bcrypt');
const Promise = require('bluebird');

const SequelizeConnector = require('../classes/sequelize-connector');
const Account = require('../models').Account;
const Roles = require('../constants/roles');

const PASSWORD_SALT_ROUNDS = 2;
const MASTER_PASSWORD_SALT_ROUNDS = 10;

// At least 6 chars, including at least one letter and one digit
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

// At least 8 chars, including at least 2 digits, one letter and one special char
const MASTER_PASSWORD_RE = /^(?=(.*\d){2})(?=.*[a-zA-Z])(?=.*[!@#$%])[0-9a-zA-Z!@#$%]{8,}/;

class AccountConnector extends SequelizeConnector {

  activateDeveloperAccount(masterPassword) {
    return this.constructor.activateDeveloperAccount(this.id, masterPassword);
  }

  toPublic() {
    return _.omit(this.toJSON(), ['password', 'masterPassword']);
  }

  get shouldValidatePassword() {
    return this.isNew || this.isModified('password');
  }

  get shouldValidateMasterPassword() {
    return this.has('masterPassword', true) && (this.isNew || this.isModified('masterPassword'));
  }

  static activateDeveloperAccount(id, masterPassword) {
    if (!masterPassword) {
      return Promise.reject(new Restypie.RestErrors.BadRequest(`Cannot activate developer account without master password.`));
    }
    return this.findById(id, { attributes: ['id', 'password', 'role'] }).then(account => {
      if (!account) {
        throw Restypie.RestErrors.NotFound(`Could not find account with id ${id}.`);
      }
      if (account.role === Roles.DEVELOPER) {
        throw new Restypie.RestErrors.Conflict(`Account ${id} is already a developer one.`);
      }
      if (account.role !== Roles.USER) {
        throw new Restypie.RestErrors.Forbidden(`Account ${id} with role ${account.role} cannot become developer.`);
      }

      return account.set({ masterPassword, role: Roles.DEVELOPER }).save();
    });
  }

  static isValidMasterPassword(masterPassword, hashedPassword) {
    return this.compareKeys(masterPassword, hashedPassword).then(matches => {
      if (matches) return { isValid: false, reason: `Master password cannot match account password` };
      return { isValid: masterPassword && MASTER_PASSWORD_RE.test(masterPassword) };
    });
  }

  static isValidPassword(password) {
    return Promise.resolve({ isValid: password && PASSWORD_RE.test(password) });
  }

  static hashPassword(password) {
    return this.hashKey(password, PASSWORD_SALT_ROUNDS);
  }

  static hashMasterPassword(masterPassword) {
    return this.hashKey(masterPassword, MASTER_PASSWORD_SALT_ROUNDS);
  }

  static hashKey(str, saltRounds) {
    return new Promise((resolve, reject) => {
      BCrypt.hash(str, saltRounds, (err, hash) => {
        if (err) return reject(err);
        return resolve(hash);
      });
    });
  }

  static validate(object) {
    return Promise.props({
      password: new Promise((resolve, reject) => {
        if (object.shouldValidatePassword) {
          return this.isValidPassword(object.password).then(result => {
            if (!result.isValid) {
              throw new Restypie.RestErrors.BadRequest(result.reason || 'Password does not match requirements.');
            }
            return resolve();
          }).catch(reject);
        }
        return resolve();
      }),

      masterPassword: new Promise((resolve, reject) => {
        if (object.shouldValidateMasterPassword) {
          return object.ensureProperties('password').then(() => {
            return this.isValidMasterPassword(object.masterPassword, object.password).then(result => {
              if (!result.isValid) {
                throw new Restypie.RestErrors.BadRequest(result.reason || 'Master password does not match requirements.');
              }
              return resolve();
            });
          }).catch(reject);
        }
        return resolve();
      })
    });
  }

  static transform(object) {
    return Promise.props({
      password: new Promise((resolve, reject) => {
        if (object.shouldValidatePassword) {
          return this.hashPassword(object.password)
            .then(hash => object.password = hash)
            .then(resolve)
            .catch(reject);
        }
        return resolve();
      }),
      masterPassword: new Promise((resolve, reject) => {
        if (object.shouldValidateMasterPassword) {
          return this.hashMasterPassword(object.masterPassword)
            .then(hash => object.masterPassword = hash)
            .then(resolve)
            .catch(reject);
        }
        return resolve();
      })
    });
  }

  static compareKeys(current, hashed) {
    return new Promise((resolve, reject) => {
      BCrypt.compare(current, hashed, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }

  static get model() { return Account; }

}

AccountConnector.PASSWORD_RE = PASSWORD_RE;
AccountConnector.MASTER_PASSWORD_RE = MASTER_PASSWORD_RE;

module.exports = AccountConnector;
'use strict';

const Validator = require('validator');
const Restypie = require('restypie');

const ClientTypes = require('../constants/client-types');
const ClientStates = require('../constants/client-states');

module.exports = (db, dataTypes) => {

  const Client = db.define('Client', {

    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    name: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    type: {
      type: dataTypes.ENUM(ClientTypes.values),
      allowNull: false,
      defaultValue: ClientTypes.PRIVATE
    },

    state: {
      type: dataTypes.ENUM(ClientStates.values),
      allowNull: false,
      defaultValue: ClientStates.SANDBOX
    },

    domain: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    homepage: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    key: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    secret: {
      type: dataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    accountId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    desc: {
      type: dataTypes.STRING,
      allowNull: true
    },

    longDesc: {
      type: dataTypes.TEXT,
      allowNull: true
    },

    logo: {
      type: dataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: value => {
          if (!Validator.isUrl(value)) {
            throw new Restypie.TemplateErrors.BadPattern({
              key: 'logo',
              expected: 'url'
            });
          }
        }
      }
    },

    tags: {
      type: dataTypes.STRING,
      allowNull: true
    },

    supportEmail: {
      type: dataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: value => {
          if (!Validator.isEmail(value)) {
            throw new Restypie.TemplateErrors.BadPattern({
              key: 'supportEmail',
              expected: 'email'
            });
          }
        }
      }
    },

    termsOfUseUrl: {
      type: dataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: value => {
          if (!Validator.isUrl(value)) {
            throw new Restypie.TemplateErrors.BadPattern({
              key: 'termsOfUseUrl',
              expected: 'url'
            });
          }
        }
      }
    },

    privacyPolicyUrl: {
      type: dataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: value => {
          if (!Validator.isUrl(value)) {
            throw new Restypie.TemplateErrors.BadPattern({
              key: 'privacyPolicyUrl',
              expected: 'url'
            });
          }
        }
      }
    }

  }, {

    tableName: 'clients'

  });

  return Client;
};
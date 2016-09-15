'use strict';

const Roles = require('../constants/roles');

module.exports = (db, dataTypes) => {

  const Account = db.define('Account', {

    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    email: {
      type: dataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    password: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    masterPassword: {
      type: dataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },

    role: {
      type: dataTypes.ENUM(Roles.values),
      allowNull: false,
      defaultValue: Roles.USER
    }

  }, {

    tableName: 'accounts'

  });

  return Account;
};
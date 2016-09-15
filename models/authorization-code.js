'use strict';

module.exports = (db, dataTypes) => {

  const AuthorizationCode = db.define('AuthorizationCode', {

    id: {
      type: dataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    accountId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    clientId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    expiresAt: {
      type: dataTypes.DATE,
      allowNull: false
    }

  }, {

    tableName: 'authorization_codes',

    scopes: {
      active: () => {
        return { where: { expiresAt: { $gte: new Date() } } };
      }
    }

  });

  return AuthorizationCode;
};
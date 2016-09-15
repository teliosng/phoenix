'use strict';

module.exports = (db, dataTypes) => {

  const AccessToken = db.define('AccessToken', {

    id: {
      type: dataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    clientId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: true // Can be a direct sign in on the site
    },

    accountId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: true // Can be an external application sign in
    }

  }, {

    tableName: 'access_tokens'

  });

  return AccessToken;
};
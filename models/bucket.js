'use strict';

module.exports = function (db, dataTypes) {

  const Bucket = db.define('Bucket', {

    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    path: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    accountId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    containerId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }

  }, {

    tableName: 'buckets'

  });

  return Bucket;

};
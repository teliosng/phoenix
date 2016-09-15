'use strict';

module.exports = function (db, dataTypes) {

  const File = db.define('File', {

    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    bucketId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    path: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    name: {
      type: dataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    extension: {
      type: dataTypes.STRING(5),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    format: {
      type: dataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    size: {
      type: dataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1
      }
    },

    quality: {
      type: dataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }

  }, {

    tableName: 'files'

  });

  return File;

};
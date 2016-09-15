'use strict';

module.exports = function (db, dataTypes) {

  const Attribute = db.define('Attribute', {

    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    mediaId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    fileId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }

  }, {

    tableName: 'attributes'

  });

  return Attribute;

};
'use strict';

module.exports = function (db, dataTypes) {

  const Container = db.define('Container', {

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
    }

  }, {

    tableName: 'containers'

  });

  return Container;

};
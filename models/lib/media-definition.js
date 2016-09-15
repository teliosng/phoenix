'use strict';

const Sequelize = require('sequelize');

const MediaTypes = require('../../constants/media-types');

const definition = {

  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  accountId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },

  fileId: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },

  type: {
    type: Sequelize.ENUM(MediaTypes.values),
    allowNull: false
  }

};

Object.freeze(definition); // Prevent accidental overrides

module.exports = definition;
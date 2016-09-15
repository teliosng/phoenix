'use strict';

const ClientTypes = require('../constants/client-types');

module.exports = {
  up: (queryInterface, Sequelize, db) => {
    return queryInterface.addColumn('clients', 'type', {
      type: Sequelize.ENUM(ClientTypes.values),
      allowNull: false,
      defaultValue: ClientTypes.PRIVATE
    });
  },

  down: (queryInterface, Sequelize, db) => {
    return queryInterface.removeColumn('clients', 'type');
  }
};
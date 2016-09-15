'use strict';

const ClientStates = require('../constants/client-states');

module.exports = {
  up: (queryInterface, Sequelize, db) => {
    return queryInterface.addColumn('clients', 'state', {
      type: Sequelize.ENUM(ClientStates.values),
      allowNull: false,
      defaultValue: ClientStates.SANDBOX
    });
  },

  down: (queryInterface, Sequelize, db) => {
    return queryInterface.removeColumn('clients', 'state');
  }
};
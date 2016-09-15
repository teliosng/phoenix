'use strict';

module.exports = {
  up(queryInterface, Sequelize, db) {
    return queryInterface.addColumn('clients', 'key', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    });
  },

  down(queryInterface, Sequelize, db) {
    return queryInterface.removeColumn('clients', 'key');
  }
};
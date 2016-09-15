'use strict';

module.exports = {
  up(queryInterface, Sequelize, db) {
    return Promise.all([
      queryInterface.addColumn('accounts', 'masterPassword', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn('accounts', 'password', {
        type: Sequelize.STRING,
        allowNull: false
      })
    ]);
  },

  down(queryInterface, Sequelize, db) {
    return queryInterface.removeColumn('accounts', 'masterPassword');
  }
};
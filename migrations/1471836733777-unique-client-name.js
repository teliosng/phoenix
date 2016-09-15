'use strict';

module.exports = {
  up(queryInterface, Sequelize, db) {
    return db.query('ALTER TABLE clients ADD UNIQUE `accounts_id_name_unique` (accountId, name);');
  },

  down(queryInterface, Sequelize, db) {
    return db.query('DROP INDEX clients_id_name_unique ON accounts;');
  }
};
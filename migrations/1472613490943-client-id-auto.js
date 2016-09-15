'use strict';

module.exports = {
  up(queryInterface, Sequelize, db, utils) {
    return db.query(utils.FK_OFF_QUERY).then(() => {
      return Promise.all([
        db.query(utils.removeConstraintQuery('access_tokens', 'clientId')),
        db.query(utils.removeConstraintQuery('authorization_codes', 'clientId'))
      ]);
    }).then(() => {
      return db.query('ALTER TABLE clients DROP PRIMARY KEY;');
    }).then(() => {
      return queryInterface.changeColumn('clients', 'id', {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      });
    }).then(() => {
      return Promise.all([
        queryInterface.changeColumn('access_tokens', 'clientId', {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true // Can be a direct sign in on the site
        }),
        queryInterface.changeColumn('authorization_codes', 'clientId', {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false
        })
      ]);
    }).then(() => {
      return Promise.all([
        db.query(utils.addConstraintQuery('access_tokens', 'clientId', 'clients')),
        db.query(utils.addConstraintQuery('authorization_codes', 'clientId', 'clients'))
      ]);
    }).then(() => {
      return db.query(utils.FK_ON_QUERY);
    });
  },

  down(queryInterface, Sequelize, db, utils) {
    return db.query(utils.FK_OFF_QUERY).then(() => {
      return Promise.all([
        db.query(utils.removeConstraintQuery('access_tokens', 'clientId')),
        db.query(utils.removeConstraintQuery('authorization_codes', 'clientId'))
      ]);
    }).then(() => {
      return db.query('ALTER TABLE clients DROP PRIMARY KEY;');
    }).then(() => {
      return queryInterface.changeColumn('clients', 'id', {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      });
    }).then(() => {
      return Promise.all([
        queryInterface.changeColumn('access_tokens', 'clientId', {
          type: Sequelize.STRING,
          allowNull: true // Can be a direct sign in on the site
        }),
        queryInterface.changeColumn('authorization_codes', 'clientId', {
          type: Sequelize.STRING,
          allowNull: false
        })
      ]);
    }).then(() => {
      return Promise.all([
        db.query(utils.addConstraintQuery('access_tokens', 'clientId', 'clients')),
        db.query(utils.addConstraintQuery('authorization_codes', 'clientId', 'clients'))
      ]);
    }).then(() => {
      return db.query(utils.FK_ON_QUERY);
    });
  }
};
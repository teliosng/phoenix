'use strict';

const Sequelize = require('sequelize');

const Configurator = require('./configurator');
const Environments = require('../constants/environments');
const Logger = require('./logger')('db');
const FS = require('fs');
const Path = require('path');

const seeds = FS.readFileSync(Path.resolve(__dirname, '../seeds/seeds.sql')).toString();
const config = Configurator.get('db');
const DB_NAME = config.name;

let tableNamesCache;

const DB = new Sequelize(config.name, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'mysql',
  logging: message => Logger.silly(message),
  dialectOptions: {
    multipleStatements: true
  },
  define: {
    charset: 'utf8',
    freezeTableName: true,
    freezeAssociations: true
  }
});

Logger.info('Connected to MySQL');

DB.reset = function () {
  if (Configurator.env === Environments.PRODUCTION) return Promise.reject(new Error('ATTEMPT TO RESET PRODUCTION DB'));

  const queryInterface = this.getQueryInterface();
  const Models = require('../models'); // eslint-disable-line global-require

  return this.transaction(transaction => {

    return queryInterface.dropTable('SequelizeMeta')
      .then(() => this.query(`SET FOREIGN_KEY_CHECKS=0;`, { transaction }))
      .then(() => queryInterface.dropTable('SequelizeMeta', { transaction }))
      .then(() => this.query('DROP VIEW IF EXISTS medias', { transaction }))
      .then(() => {
        return Promise.all(Object.keys(Models).map(modelName => {
          return this.query(`DROP TABLE IF EXISTS ${Models[modelName].tableName};`, { transaction });
        }));
      })
      .then(() => require('./umzug').up()) // eslint-disable-line global-require
      .then(() => this.query('SET FOREIGN_KEY_CHECKS=1;', { transaction }))
      .then(() => this.importSeeds({ transaction }));
  });
};

DB.importSeeds = function (options = {}) {
  return this.query(seeds, options);
};

DB.listTables = function (force = false) {
  if (force !== true && tableNamesCache) return Promise.resolve(tableNamesCache);

  const sql = 'SHOW FULL TABLES IN `' + DB_NAME + "` WHERE TABLE_TYPE NOT LIKE 'VIEW'"; // eslint-disable-line prefer-template

  return this.query(sql).spread(results => {
    tableNamesCache = results.map(result => {
      const tableName = `Tables_in_${DB_NAME}`;
      return result[tableName];
    });
    return Promise.resolve(tableNamesCache);
  });
};

DB.truncate = function (forceRefreshTablesList = false) {
  if (Configurator.env === Environments.PRODUCTION) return Promise.reject(new Error('ATTEMPT TO DELETE PRODUCTION DB'));

  // TODO insert seeds !
  return this.transaction(transaction => {
    return this.query(`SET FOREIGN_KEY_CHECKS=0;`, { transaction })
      .then(() => this.listTables(forceRefreshTablesList))
      .then(tables => Promise.all(tables.map(table => this.query(`DELETE FROM ${table};`, { transaction }))))
      .then(() => this.query('SET FOREIGN_KEY_CHECKS=1;', { transaction }));
  });
};

module.exports = DB;
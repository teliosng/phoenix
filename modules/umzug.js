'use strict';

const Umzug = require('umzug');

const DB = require('./db');

class Utils {

  static addConstraintQuery(table, foreignKey, target, targetProp = 'id', onUpdate = 'CASCADE', onDelete = 'CASCADE') { // eslint-disable-line max-params
    return `
      ALTER TABLE ${table}
      ADD CONSTRAINT ${table}_${foreignKey}_fk
      FOREIGN KEY (${foreignKey}) REFERENCES ${target} (${targetProp})
      ON UPDATE ${onUpdate}
      ON DELETE ${onDelete};
    `;
  }

  static removeConstraintQuery(table, foreignKey) {
    return `
      ALTER TABLE ${table}
      DROP FOREIGN KEY ${table}_${foreignKey}_fk;
    `;
  }

  static addTimestampsQuery(tableName) {
    return `
      ALTER TABLE ${tableName}
      ADD COLUMN createdAt TIMESTAMP DEFAULT NOW(),
      ADD COLUMN updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW();
    `;
  }

  static get FK_OFF_QUERY() {
    return `SET FOREIGN_KEY_CHECKS = 0;`;
  }

  static get FK_ON_QUERY() {
    return `SET FOREIGN_KEY_CHECKS = 1;`;
  }

}

module.exports = new Umzug({
  storage: 'sequelize',
  storageOptions: {
    sequelize: DB
  },
  migrations: {
    params: [DB.getQueryInterface(), DB.constructor, DB, Utils]
  }
});
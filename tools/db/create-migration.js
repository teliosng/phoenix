'use strict';

const FS = require('fs');
const Path = require('path');

const Tool = require('../lib/tool');

const TEMPLATE = `'use strict';

module.exports = {
  up: function (queryInterface, Sequelize, db) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: function (queryInterface, Sequelize, db) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};`;

class CreateMigrationDBTool extends Tool {

  run() {
    const fileName = `${Date.now()}-${this.args.name}.js`;
    return new Promise((resolve, reject) => {
      FS.writeFile(Path.join(process.cwd(), 'migrations', fileName), TEMPLATE, err => {
        if (err) return reject(err);
        return resolve(fileName);
      });
    });
  }

  displayResults(name) {
    this.info(`Migration file ${name} has been created`);
    return super.displayResults();
  }

  static describe(yargs) {
    return yargs
      .demand('name');
  }
}

module.exports = CreateMigrationDBTool;
'use strict';

const Colors = require('colors/safe');

const Configurator = require('../../modules/configurator');
const Environments = require('../../constants/environments');

class Tool {

  get args() { return this._args; }

  get env() { return this._env; }

  get envColor() {
    switch (this._env) {
      case Environments.PRODUCTION:
        return 'red';
      case Environments.STAGING:
        return 'yellow';
      case Environments.DEVELOPMENT:
        return 'white';
      case Environments.TEST:
        return 'gray';
    }
  }

  constructor(args) {
    this._args = args;
    this._env = Configurator.env;
    this._logger = require('../../modules/logger')(Colors[this.envColor](this.constructor.name + '-' + this._env));
  }

  doRun() {
    this.info('Running tool...');
    this.run()
      .then(this.displayResults.bind(this))
      .catch(this.onError.bind(this));
  }

  run() {
    throw new Error('Tool must implement ".run()"');
  }

  displayResults() {
    this.info('Successfully ran tool.');
    return process.exit(0);
  }
  onError(err) {
    this.error(err.stack || err);
    return process.exit(1);
  }

  debug() { return this._logger.debug.apply(this._logger, arguments); }
  info() { return this._logger.info.apply(this._logger, arguments); }
  error() { return this._logger.error.apply(this._logger, arguments); }
  warn() { return this._logger.warn.apply(this._logger, arguments); }

  static describe() {
    throw new Error('Tool must implement "#describe()"');
  }
}


module.exports = Tool;
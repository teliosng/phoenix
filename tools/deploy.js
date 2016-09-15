'use strict';

const ChildProcess = require('child_process');

const SmartEnum = require('../classes/smart-enum');
const Tool = require('./lib/tool');
const Environments = require('../constants/environments');

const EBApps = new SmartEnum({
  API_STAGING: 'api-staging',
  AUTH_STAGING: 'auth-staging'
});

class DeployTool extends Tool {
  run() {
    return new Promise((resolve, reject) => {
      let apiApp;
      let authApp;

      switch (this.args.env) {
        case Environments.PRODUCTION:
          apiApp = EBApps.API_PRODUCTION;
          authApp = EBApps.AUTH_PRODUCTION;
          break;
        case Environments.STAGING:
          apiApp = EBApps.API_STAGING;
          authApp = EBApps.AUTH_STAGING;
          break;
        default: throw new Error(`Unsupported env: ${this.rags.env}`);
      }

      this.info(`Selecting ${apiApp}`);
      ChildProcess.exec(`eb use ${apiApp}`, err => {
        if (err) return reject(err);
        this.info(`Deploying ${apiApp}`);
        ChildProcess.exec('eb deploy', err => {
          if (err) return reject(err);
          this.info(`Selecting ${authApp}`);
          ChildProcess.exec(`eb use ${authApp}`, err => {
            if (err) return reject(err);
            this.info(`Deploying ${authApp}`);
            ChildProcess.exec('eb deploy', err => {
              if (err) return reject(err);
              return resolve();
            });
          });
        });
      });
    });
  }

  static describe(yargs) {
    return yargs
      .demand('env');
  }
}

module.exports = DeployTool;
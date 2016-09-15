'use strict';

const Path = require('path');
const ChildProcess = require('child_process');

const Apps = require('../constants/apps');
const Tool = require('./lib/tool');


class StartTool extends Tool {

  run() {
    return new Promise((resolve, reject) => {
      const appName = this.args.app;

      if (!Apps.has(appName)) return reject(`Can't find app named ${appName}`);

      let child;
      try {
        child = ChildProcess.fork(Path.resolve(__dirname, `../servers/${appName}`));
      } catch (ex) {
        return reject(ex);
      }
      child.on('error', reject);
      process.on('SIGINT', () => {
        this.info(`Shutting down ${appName}...`);
        child.kill();
        return resolve();
      });
    });
  }

  static describe(yargs) {
    return yargs
      .demand('app');
  }
}


module.exports = StartTool;
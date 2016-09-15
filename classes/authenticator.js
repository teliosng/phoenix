'use strict';

const Restypie = require('restypie');

const SmartEnum = require('./smart-enum');
const Connectors = require('../connectors');
const Roles = require('../constants/roles');

const Modes = new SmartEnum({
  PASSWORD: 'password',
  MASTER_PASSWORD: 'master_password',
  CLIENT_CREDENTIALS: 'client_credentials',
  ACCESS_TOKEN: 'access_token',
  API_KEY: 'api_key',
  SESSION: 'session'
});

const Schemes = new SmartEnum({
  BASIC: 'Basic',
  BEARER: 'Bearer',
  API_KEY: 'APIKEY'
});

const ALL_MODES = Symbol('ALL_MODES');

const Profiles = new SmartEnum({
  WEB_APP: [Modes.SESSION, Modes.PASSWORD, Modes.MASTER_PASSWORD]
});

class Authenticator {

  get modes() { return this._modes; }

  constructor(options = {}) {
    let modes = options.modes;
    if (!modes) throw new Error(`An Authenticator requires a "modes" option with at least one selection`);
    if (!Array.isArray(modes)) modes = [modes];
    if (modes.includes(Authenticator.ALL_MODES)) modes = Modes.values;
    modes.forEach(mode => {
      if (!Modes.has(mode)) throw new Error(`Unknown authentication mode: ${mode}`);
    });
    if (!modes.length) throw new Error(`An Authenticator requires a "modes" option with at least one selection`);
    this._modes = modes;
  }

  authenticate(req) {
    const header = Authenticator.extractAuthorizationHeader(req) || '';

    return new Promise((resolve, reject) => {
      let i = -1;
      (function next() {
        const mode = this._modes[++i];
        if (!mode) return reject(new Restypie.RestErrors.Unauthorized()); // No more modes to try
        this.getMethodForMode(mode)(req, header).then(isAuthenticated => {
          if (isAuthenticated) {
            req.isAuthenticated = true;
            return resolve();
          }
          return next.call(this);
        }).catch(reject);
      }).call(this);
    });
  }

  authenticateWithPassword(req, header) {
    const credentials = Authenticator.decodeBasicCredentials(header);
    return Connectors.Account.findOne({ email: credentials.identifier }).then(account => {
      if (account) {
        return Connectors.Account.compareKeys(credentials.password, account.password).then(matches => {
          if (!matches) return false;
          Object.assign(req, { account, authenticationMode: Modes.PASSWORD });
          return true;
        });
      }
      return false;
    });
  }

  authenticateWithMasterPassword(req, header) {
    const credentials = Authenticator.decodeBasicCredentials(header);
    return Connectors.Account.findOne({ email: credentials.identifier, role: Roles.DEVELOPER }).then(account => {
      if (account) {
        return Connectors.Account.compareKeys(credentials.password, account.masterPassword).then(matches => {
          if (!matches) return false;
          Object.assign(req, { account, authenticationMode: Modes.MASTER_PASSWORD });
          return true;
        });
      }
      return false;
    });
  }

  authenticateWithApiKey(req, header) {
    return Connectors.Client.findOne({ key: Authenticator.excludeScheme(header, Schemes.API_KEY) }).then(client => {
      if (client) {
        return Connectors.Account.findById(client.accountId).then(account => {
          Object.assign(req, { client, account, authenticationMode: Modes.API_KEY });
          return true;
        });
      }
      return false;
    });
  }

  authenticateWithAccessToken(req, header) {
    return Connectors.AccessToken.findById(Authenticator.excludeScheme(header, Schemes.BEARER)).then(token => {
      if (token) {
        return Connectors.Account.findById(token.accountId).then(account => {
          Object.assign(req, { account, authenticationMode: Modes.ACCESS_TOKEN });
          return true;
        });
      }

      return false;
    });
  }

  authenticateWithSession(req) {
    const account = req.session && req.session.account;

    // TODO check for client as well ?

    if (account) {
      Object.assign(req, { account, authenticationMode: Modes.SESSION });
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  authenticateWithClientCredentials(req, header) {
    const credentials = Authenticator.decodeBasicCredentials(header);
    return Connectors.Client.findOne({ key: credentials.identifier }).then(client => {
      if (client && credentials.password === client.secret) {
        return Connectors.Account.findById(client.accountId).then(account => {
          Object.assign(req, { account, client, authenticationMode: Modes.CLIENT_CREDENTIALS });
          return true;
        });
      }

      return false;
    });
  }

  getMethodForMode(mode) {
    let method;
    switch (mode) {
      case Modes.PASSWORD:
        method = this.authenticateWithPassword;
        break;
      case Modes.MASTER_PASSWORD:
        method = this.authenticateWithMasterPassword;
        break;
      case Modes.ACCESS_TOKEN:
        method = this.authenticateWithAccessToken;
        break;
      case Modes.API_KEY:
        method = this.authenticateWithApiKey;
        break;
      case Modes.SESSION:
        method = this.authenticateWithSession;
        break;
      case Modes.CLIENT_CREDENTIALS:
        method = this.authenticateWithClientCredentials;
        break;
      default: throw new Error(`Unknown authentication mode: ${mode}`);
    }
    return method.bind(this);
  }

  static encodeBasicCredentials(identifier, password) {
    return `${Schemes.BASIC} ${new Buffer(`${identifier}:${password}`).toString('base64')}`;
  }

  static decodeBasicCredentials(header) {
    const decoded = Buffer.from(this.excludeScheme(header, Schemes.BASIC), 'base64').toString().split(':');
    return { identifier: decoded[0], password: decoded[1] };
  }

  static extractAuthorizationHeader(req) {
    return req.get('authorization');
  }

  static hasScheme(header, scheme) {
    return new RegExp(`^${scheme}\\s+`, 'i').test(header);
  }

  static excludeScheme(header, scheme) {
    return header.replace(new RegExp(`(^${scheme}\\s+)`, 'i'), '');
  }
}

Authenticator.Modes = Modes;
Authenticator.Profiles = Profiles;
Authenticator.Schemes = Schemes;
Authenticator.ALL_MODES = ALL_MODES;


module.exports = Authenticator;
'use strict';

const Promise = require('bluebird');
const supertest = require('supertest-as-promised');
const Restypie = require('restypie');

const Roles = require('../../constants/roles');
const auth = require('../../apps/auth');
const Connectors = require('../../connectors');
const TestUtils = require('../_utils');

let uuid = 0;

class Fixtures {

  static uuid() {
    return ++uuid;
  }

  static createAccount(props = {}) {
    const password = TestUtils.generatePassword();
    const masterPassword = props.role === Roles.DEVELOPER ? TestUtils.generateMasterPassword() : null;

    return Connectors.Account.create(Object.assign({
      email: `john.${Fixtures.uuid()}@example.com`,
      password,
      masterPassword
    }, props)).then(account => {
      account.rawPassword = password; // Save raw password to allow login
      account.rawMasterPassword = masterPassword;
      return account;
    });
  }

  static findAccountById() {
    return Connectors.Account.findById(...arguments);
  }

  static login(account, agent) {
    const pre = {};

    if (arguments.length < 2) {
      if (!arguments[0] || (!arguments[0].email && !arguments[0].password && !arguments[0].id)) {
        pre.account = Fixtures.createAccount();
        agent = account;
      }
    }

    agent = agent || supertest.agent(auth);

    return Promise.props(pre).then(result => {
      if (result.account) account = result.account;

      return agent
        .post('/login')
        .send({ email: account.email, password: account.rawPassword })
        .expect(Restypie.Codes.OK)
        .then(() => agent);
    });

  }

  static getAuthorization(params = {}) {
    const pre = {};

    if (!params.account) pre.account = Fixtures.createAccount();
    if (!params.client) pre.client = Fixtures.createClient();

    return Promise.props(pre).then(result => {
      if (result.account) params.account = result.account;
      if (result.client) params.client = result.client;
      return Fixtures.login(params.account).then(agent => {
        return agent
          .get('/authorize')
          .query({
            response_type: 'code',
            client_id: params.client.id
          })
          .set('Accept', 'application/json')
          .then(res => {
            return Object.assign(res.body, { agent });
          });
      });
    });
  }

  static createAccessToken(props = {}) {
    const pre = {};

    if (!props.accountId) pre.account = Fixtures.createAccount();
    if (!props.clientId) pre.client = Fixtures.createClient();

    return Promise.props(pre).then(result => {
      if (result.account) props.accountId = result.account.id;
      if (result.client) props.clientId = result.client.id;
      return Connectors.AccessToken.create(Object.assign({}, props)).then(object => Object.assign(object, result));
    });
  }

  static countAccessTokens(filters = {}) {
    return Connectors.AccessToken.count(filters);
  }

  static createAuthorizationCode(props = {}) {
    const pre = {};

    if (!props.accountId) pre.account = Fixtures.createAccount();
    if (!props.clientId) pre.client = Fixtures.createClient();

    return Promise.props(pre).then(result => {
      if (result.account) props.accountId = result.account.id;
      if (result.client) props.clientId = result.client.id;
      return Connectors.AuthorizationCode.create(Object.assign({}, props))
        .then(created => Object.assign(created, result));
    });
  }


  static createContainer(props = {}) {
    return Connectors.Container.create(Object.assign({
      path: `/container-${Fixtures.uuid()}`
    }, props));
  }

  static createBucket(props = {}) {
    const pre = {};

    if (!props.containerId) pre.container = Fixtures.createContainer();
    if (!props.accountId) pre.account = Fixtures.createAccount();

    return Promise.props(pre)
      .then(result => {
        if (result.container) props.containerId = result.container.id;
        if (result.account) props.accountId = result.account.id;

        return Connectors.Bucket.create(Object.assign({
          path: `/bucket-${Fixtures.uuid()}`
        }, props));
      });
  }

  static createClient(props = {}) {
    const pre = {};

    if (!props.accountId) pre.account = Fixtures.createAccount({ role: Roles.DEVELOPER });

    return Promise.props(pre).then(result => {
      if (result.account) props.accountId = result.account.id;
      const domain = `http://${Fixtures.uuid()}.com`;
      return Connectors.Client.create(Object.assign({
        name: `Client${Fixtures.uuid()}`,
        domain,
        homepage: `${domain}/home`
      }, props)).then(object => Object.assign(object, result));

    });

  }

  static countClients() {
    return Connectors.Client.count(...arguments);
  }

  static findClientById() {
    return Connectors.Client.findById(...arguments);
  }


}


module.exports = Fixtures;
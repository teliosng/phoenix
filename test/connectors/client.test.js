'use strict';

const Connectors = require('../../connectors');
const ClientTypes = require('../../constants/client-types');
const ClientStates = require('../../constants/client-states');
const Fixtures = require('../_utils/fixtures');
const Roles = require('../../constants/roles');

describe('Connectors.Client', function () {
  describe('#create()', function () {
    it('should be able to publish a private client', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PRIVATE,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          state: ClientStates.LIVE
        }).then(client => {
          expect(client.state).to.equal(ClientStates.LIVE);
        });
      });
    });
    it('should be able to publish a public client', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PUBLIC,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          state: ClientStates.LIVE,
          logo: 'http://files.mdbk.io/path-to-logo',
          desc: 'A short description'
        }).then(client => {
          expect(client.state).to.equal(ClientStates.LIVE);
        });
      });
    });
    it('should not be able to publish a public client (missing logo)', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PUBLIC,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          state: ClientStates.LIVE,
          desc: 'A short description'
        }).then(() => {
          throw new Error('Should not have passed');
        }, err => {
          expect(err.message).to.match(/logo/);
        });
      });
    });
    it('should not be able to publish a public client (missing desc)', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PUBLIC,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          state: ClientStates.LIVE,
          logo: 'http://files.mdbk.io/path-to-logo'
        }).then(() => {
          throw new Error('Should not have passed');
        }, err => {
          expect(err.message).to.match(/desc/);
        });
      });
    });
  });

  describe('#update', function () {
    it('should be able to publish a private client', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PRIVATE,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id
        }).then(client => {
          return client.set('state', ClientStates.LIVE).save();
        });
      });
    });
    it('should be able to publish a public client', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PUBLIC,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          logo: 'http://files.mdbk.io/path-to-logo',
          desc: 'A short description'
        }).then(client => {
          return client.set('state', ClientStates.LIVE).save();
        });
      });
    });
    it('should not be able to publish a public client (missing logo)', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PUBLIC,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          desc: 'A short description'
        }).then(client => {
          return client.set('state', ClientStates.LIVE).save();
        }).then(() => {
          throw new Error('Should not have passed');
        }, err => {
          expect(err.message).to.match(/logo/);
        });
      });
    });
    it('should not be able to publish a public client (missing desc)', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return Connectors.Client.create({
          type: ClientTypes.PUBLIC,
          name: 'My App',
          domain: 'http://example.com',
          homepage: 'http://example.com',
          accountId: account.id,
          logo: 'http://files.mdbk.io/path-to-logo'
        }).then(client => {
          return client.set('state', ClientStates.LIVE).save();
        }).then(() => {
          throw new Error('Should not have passed');
        }, err => {
          expect(err.message).to.match(/desc/);
        });
      });
    });
  });
});
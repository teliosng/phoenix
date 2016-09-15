'use strict';

const Restypie = require('restypie');
const supertest = require('supertest-as-promised');

const Fixtures = require('../../_utils/fixtures');
const Authenticator = require('../../../classes/authenticator');
const DBHelper = require('../../_utils/db-helper');
const api = require('../../../apps/api');
const Roles = require('../../../constants/roles');
const ClientTypes = require('../../../constants/client-types');
const ClientStates = require('../../../constants/client-states');

describe('Resources.Clients', function () {
  beforeEach(function () {
    return DBHelper.truncate();
  });

  describe('POST /v1/clients', function () {
    it('should create a private client', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return supertest(api)
          .post('/v1/clients')
          .send({
            name: 'test',
            domain: 'http://test.example.com',
            homepage: 'http://test.example.com',
            type: ClientTypes.PRIVATE
          })
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.Created)
          .then(res => {
            const created = res.body.data;
            expect(created).to.exist.and.containSubset({
              name: 'test',
              domain: 'http://test.example.com',
              homepage: 'http://test.example.com/',
              type: ClientTypes.PRIVATE,
              state: ClientStates.SANDBOX
            });
          });
      });
    });

    it('should be able to create a public client without all properties', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return supertest(api)
          .post('/v1/clients')
          .send({
            name: 'test',
            domain: 'http://test.example.com',
            homepage: 'http://test.example.com',
            type: ClientTypes.PUBLIC
          })
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.Created)
          .then(res => {
            const created = res.body.data;
            expect(created).to.exist.and.containSubset({
              name: 'test',
              domain: 'http://test.example.com',
              homepage: 'http://test.example.com/',
              type: ClientTypes.PUBLIC,
              state: ClientStates.SANDBOX
            });
          });
      });
    });

    it('should be able to create a public client with all properties', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return supertest(api)
          .post('/v1/clients')
          .send({
            name: 'test',
            domain: 'http://test.example.com',
            homepage: 'http://test.example.com',
            type: ClientTypes.PUBLIC,
            desc: 'An description',
            longDesc: 'An longer description',
            logo: 'https://files.mdbk.io/pah-to-file',
            tags: 'tag1,tag2,tag3',
            supportEmail: 'support@example.com',
            termsOfUseUrl: 'http://example.com/terms-of-use',
            privacyPolicyUrl: 'http://example.com/privacy-policy'
          })
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.Created)
          .then(res => {
            const created = res.body.data;
            expect(created).to.exist.and.containSubset({
              name: 'test',
              domain: 'http://test.example.com',
              homepage: 'http://test.example.com/',
              type: ClientTypes.PUBLIC,
              state: ClientStates.SANDBOX,
              desc: 'An description',
              longDesc: 'An longer description',
              logo: 'https://files.mdbk.io/pah-to-file',
              tags: 'tag1,tag2,tag3',
              supportEmail: 'support@example.com',
              termsOfUseUrl: 'http://example.com/terms-of-use',
              privacyPolicyUrl: 'http://example.com/privacy-policy'
            });
          });
      });
    });

    it('should not be able to create a client (supportEmail is not a valid email)', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return supertest(api)
          .post('/v1/clients')
          .send({
            name: 'test',
            domain: 'http://test.example.com',
            homepage: 'http://test.example.com',
            type: ClientTypes.PUBLIC,
            supportEmail: 'toto'
          })
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.BadRequest)
          .then(res => {
            const body = res.body;
            expect(body.error).to.equal(true);
            expect(body.message).to.match(/supportEmail/);
          });
      });
    });

    it('should not be able to create a client (termsOfUseUrl is not a valid url)', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
        return supertest(api)
          .post('/v1/clients')
          .send({
            name: 'test',
            domain: 'http://test.example.com',
            homepage: 'http://test.example.com',
            type: ClientTypes.PUBLIC,
            termsOfUseUrl: 'toto'
          })
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.BadRequest)
          .then(res => {
            const body = res.body;
            expect(body.error).to.equal(true);
            expect(body.message).to.match(/termsOfUseUrl/);
          });
      });
    });
  });

  describe('GET /v1/clients/:id', function () {
    it('should be able to select API key', function () {
      return Fixtures.createClient().then(client => {
        const account = client.account;
        return supertest(api)
          .get(`/v1/clients/${client.id}`)
          .query(Restypie.stringify({ select: ['key'] }))
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawMasterPassword))
          .expect(Restypie.Codes.OK)
          .then(res => {
            expect(res.body.data.key).to.be.a('string');
          });
      });
    });
    it('should not be able to select API key (not master password)', function () {
      return Fixtures.createClient().then(client => {
        const account = client.account;
        return supertest(api)
          .get(`/v1/clients/${client.id}`)
          .query(Restypie.stringify({ select: ['key'] }))
          .set('accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.Forbidden);
      });
    });
  });

  describe('PATCH /v1/clients/:id', function () {
    it('should be able to modify an application', function () {
      return Fixtures.createClient({ type: ClientTypes.PUBLIC }).then(client => {
        const account = client.account;
        return supertest(api)
          .patch(`/v1/clients/${client.id}`)
          .send({
            desc: 'A new desc',
            supportEmail: 'toto@example.com'
          })
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.NoContent)
          .then(() => {
            return Fixtures.findClientById(client.id).then(client => {
              expect(client).to.containSubset({
                desc: 'A new desc',
                supportEmail: 'toto@example.com'
              });
            });
          });
      });
    });
  });

  describe('DELETE /v1/clients/:id', function () {
    it('should be able to delete a client', function () {
      return Fixtures.createClient().then(client => {
        return Promise.all([
          Fixtures.createAccessToken({ clientId: client.id }),
          Fixtures.createAccessToken({ clientId: client.id })
        ]).then(() => {
          const account = client.account;
          return supertest(api)
            .delete(`/v1/clients/${client.id}`)
            .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawMasterPassword))
            .expect(Restypie.Codes.NoContent)
            .then(() => {
              return Fixtures.countClients({ id: client.id }).then(count => {
                expect(count).to.equal(0);
                return Fixtures.countAccessTokens({ clientId: client.id }).then(count => {
                  expect(count).to.equal(0);
                });
              });
            });
        });
      });
    });
    it('should not be able to delete a client (not master password)', function () {
      return Fixtures.createClient().then(client => {
        const account = client.account;
        return supertest(api)
          .delete(`/v1/clients/${client.id}`)
          .set('Accept', 'application/json')
          .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
          .expect(Restypie.Codes.Unauthorized)
          .then(() => {
            return Fixtures.countClients({ id: client.id }).then(count => {
              expect(count).to.equal(1);
            });
          });
      });
    });
  });

});
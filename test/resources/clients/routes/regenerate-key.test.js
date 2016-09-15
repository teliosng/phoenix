'use strict';

const supertest = require('supertest-as-promised');
const Restypie = require('restypie');

const Authenticator = require('../../../../classes/authenticator');
const Fixtures = require('../../../_utils/fixtures');
const DBHelper = require('../../../_utils/db-helper');
const api = require('../../../../apps/api');
const Roles = require('../../../../constants/roles');


describe('Resources.Client.RegenerateKeyRoute', function () {
  beforeEach(function () {
    return DBHelper.truncate();
  });

  it('should regenerate key (owner request)', function () {
    return Fixtures.createClient().then(client => {
      const account = client.account;
      return supertest(api)
        .patch(`/v1/clients/${client.id}/regenerate-key`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawMasterPassword))
        .expect(Restypie.Codes.OK)
        .then(res => {
          expect(res.body.data.key).to.be.a('string').and.not.equal(client.key);
          return Fixtures.findClientById(client.id).then(retrieved => {
            expect(retrieved.key).to.equal(res.body.data.key);
          });
        });
    });
  });

  it('should regenerate key (admin request)', function () {
    return Fixtures.createClient().then(client => {
      return Fixtures.createAccount({ role: Roles.ADMIN }).then(admin => {
        const account = client.account;
        return supertest(api)
          .patch(`/v1/clients/${client.id}/regenerate-key`)
          .set('Authorization', Authenticator.encodeBasicCredentials(admin.email, account.rawPassword))
          .expect(Restypie.Codes.OK)
          .then(res => {
            expect(res.body.data.key).to.be.a('string').and.not.equal(client.key);
            return Fixtures.findClientById(client.id).then(retrieved => {
              expect(retrieved.key).to.equal(res.body.data.key);
            });
          });
      });
    });
  });

  it('should not regenerate key (not owner nor admin request)', function () {
    return Fixtures.createClient().then(client => {
      const account = client.account;
      return supertest(api)
        .patch(`/v1/clients/${client.id}/regenerate-key`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .expect(Restypie.Codes.Forbidden);
    });
  });

  it('should not regenerate (client does not exist)', function () {
    return Fixtures.createClient().then(client => {
      const account = client.account;
      return supertest(api)
        .patch(`/v1/clients/999/regenerate-key`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .expect(Restypie.Codes.NotFound);
    });
  });
});
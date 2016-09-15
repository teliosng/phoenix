'use strict';

const Restypie = require('restypie');
const supertest = require('supertest-as-promised');
const Promise = require('bluebird');

const Fixtures = require('../../../_utils/fixtures');
const Authenticator = require('../../../../classes/authenticator');
const TestUtils = require('../../../_utils');
const DBHelper = require('../../../_utils/db-helper');
const api = require('../../../../apps/api');
const Roles = require('../../../../constants/roles');

describe('Resources.Account.Routes.ActivateDeveloperAccount', function () {
  beforeEach(function () {
    return DBHelper.truncate();
  });

  it('should reject request if requester is not admin', function () {
    return Promise.props({
      account: Fixtures.createAccount(),
      requester: Fixtures.createAccount()
    }).then(results => {
      return supertest(api)
        .patch(`/v1/accounts/${results.account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(results.requester.email, results.requester.rawPassword))
        .send({ masterPassword: TestUtils.generateMasterPassword() })
        .expect(Restypie.Codes.Forbidden)
        .then(res => {
          expect(res.body.message).to.match(/activate/);
        });
    });
  });

  it('should reject request if requester is not the owner', function () {
    return Promise.props({
      account: Fixtures.createAccount(),
      requester: Fixtures.createAccount()
    }).then(results => {
      return supertest(api)
        .patch(`/v1/accounts/${results.account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(results.requester.email, results.requester.rawPassword))
        .send({ masterPassword: TestUtils.generateMasterPassword() })
        .expect(Restypie.Codes.Forbidden)
        .then(res => {
          expect(res.body.message).to.match(/activate/);
        });
    });
  });

  it('should activate account if request is admin', function () {
    const masterPassword = TestUtils.generateMasterPassword();

    return Promise.props({
      account: Fixtures.createAccount(),
      requester: Fixtures.createAccount({ role: Roles.ADMIN })
    }).then(results => {
      return supertest(api)
        .patch(`/v1/accounts/${results.account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(results.requester.email, results.requester.rawPassword))
        .send({ masterPassword })
        .expect(Restypie.Codes.NoContent)
        .then(() => {
          return Fixtures.findAccountById(results.account.id).then(account => {
            expect(account.role).to.equal(Roles.DEVELOPER);
            expect(account.masterPassword).to.be.a('string').and.not.equal(masterPassword);
          });
        });
    });
  });

  it('should activate account if requester is owner', function () {
    const masterPassword = TestUtils.generateMasterPassword();

    return Fixtures.createAccount().then(account => {
      return supertest(api)
        .patch(`/v1/accounts/${account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .send({ masterPassword })
        .expect(Restypie.Codes.NoContent)
        .then(() => {
          return Fixtures.findAccountById(account.id).then(account => {
            expect(account.role).to.equal(Roles.DEVELOPER);
            expect(account.masterPassword).to.be.a('string').and.not.equal(masterPassword);
          });
        });
    });
  });

  it('should reject request if masterPassword is missing', function () {
    return Fixtures.createAccount().then(account => {
      return supertest(api)
        .patch(`/v1/accounts/${account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .send({})
        .expect(Restypie.Codes.BadRequest)
        .then(res => {
          expect(res.body.message).to.match(/masterPassword/);
        });
    });
  });

  it('should reject request if masterPassword does not match requirements', function () {
    return Fixtures.createAccount().then(account => {
      return supertest(api)
        .patch(`/v1/accounts/${account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .send({ masterPassword: '123kjshdkj' })
        .expect(Restypie.Codes.BadRequest)
        .then(res => {
          expect(res.body.message).to.match(/requirements/);
        });
    });
  });

  it('should return a 406 if account is already a developer one', function () {
    return Fixtures.createAccount({
      role: Roles.DEVELOPER
    }).then(account => {
      return supertest(api)
        .patch(`/v1/accounts/${account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .send({ masterPassword: TestUtils.generateMasterPassword() })
        .expect(Restypie.Codes.Conflict)
        .then(res => {
          expect(res.body.message).to.match(/already/);
        });
    });
  });

  it('should not accept to activate developer account for non-user account', function () {
    return Fixtures.createAccount({ role: Roles.ADMIN }).then(account => {
      return supertest(api)
        .patch(`/v1/accounts/${account.id}/activate-developer-account`)
        .set('Authorization', Authenticator.encodeBasicCredentials(account.email, account.rawPassword))
        .send({ masterPassword: TestUtils.generateMasterPassword() })
        .expect(Restypie.Codes.Forbidden)
        .then(res => {
          expect(res.body.message).to.match(/developer/);
        });
    });
  });
});

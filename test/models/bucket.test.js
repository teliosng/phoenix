'use strict';

const DBHelper = require('../_utils/db-helper');
const Fixtures = require('../_utils/fixtures');
const Roles = require('../../constants/roles');

describe('Models.Account', function () {

  beforeEach(function () {
    return DBHelper.truncate();
  });

  describe('create', function () {

    it('should create bucket', function () {
      return Fixtures.createBucket();
    });

    it('should create a bucket for a user account', function () {
      return Fixtures.createAccount({ role: Roles.USER })
        .then(account => {
          return Fixtures.createBucket({ accountId: account.id });
        });
    });

    it('should NOT create a second bucket for a user account', function () {
      return Fixtures.createAccount({ role: Roles.USER })
        .then(account => {
          return Fixtures.createBucket({ accountId: account.id }).then(() => {
            return Fixtures.createBucket({ accountId: account.id }).then(() => {
              return Promise.reject(new Error('Second bucket should not have been created'));
            }, err => {
              if (err.message.match(/single bucket/)) return Promise.resolve();
              return Promise.reject(err);
            });
          });
        });
    });

    it('should create a second bucket for developer account', function () {
      return Fixtures.createAccount({ role: Roles.DEVELOPER })
        .then(account => {
          return Fixtures.createBucket({ accountId: account.id }).then(() => {
            return Fixtures.createBucket({ accountId: account.id });
          });
        });
    });

  });

});
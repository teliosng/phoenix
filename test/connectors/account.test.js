'use strict';

const DBHelper = require('../_utils/db-helper');

const Account = require('../../connectors').Account;
const Roles = require('../../constants/roles');

describe('Connectors.Account', function () {

  beforeEach(function () {
    return DBHelper.truncate();
  });

  describe('#create()', function () {
    it('should create an account with role = user and encrypted password', function () {
      return Account.create({
        email: 'test@example.com',
        password: 'password123'
      }).then(created => {
        expect(created.email).to.equal('test@example.com');
        expect(created.role).to.equal(Roles.USER);
        expect(created.password).to.be.a('string').and.not.equal('password123');
      });
    });
  });

  describe('#update()', function () {
    it('should encrypt masterPassword', function () {
      return Account.create({
        email: 'test@example.com',
        password: 'password123'
      }).then(created => {
        return created.set('masterPassword', 'Ag0odP@@@assw0rd').save();
      }).then(saved => {
        expect(saved.masterPassword).to.be.a('string').and.not.equal('Ag0odP@@@assw0rd');
      });
    });
  });

});
'use strict';

const HTTPMocks = require('node-mocks-http');
const Restypie = require('restypie');

const Roles = require('../../constants/roles');
const Fixtures = require('../_utils/fixtures');
const DBHelper = require('../_utils/db-helper');
const Authenticator = require('../../classes/authenticator');

describe('Classes.Authenticator', function () {

  describe('constructor', function () {
    it('should throw if no modes', function () {
      expect(() => new Authenticator()).to.throw(/at least one/);
    });
    it('should throw if empty array', function () {
      expect(() => new Authenticator({ modes: [] })).to.throw(/at least one/);
    });
    it('should throw if unknown mode', function () {
      expect(() => new Authenticator({ modes: ['foo'] })).to.throw(/Unknown authentication mode/);
    });
    it('should instantiate', function () {
      expect(() => new Authenticator({ modes: [Authenticator.Modes.PASSWORD] })).to.not.throw();
    });
    it('should have all modes', function () {
      const authenticator = new Authenticator({ modes: Authenticator.ALL_MODES });
      expect(authenticator.modes).to.deep.equal(Authenticator.Modes.values);
    });
  });

  describe('.authenticate()', function () {

    beforeEach(function () {
      return DBHelper.truncate();
    });

    describe('Password', function () {
      it('should authenticate user with email and password', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.account).to.containSubset(account.toJSON());
          });
        });
      });
      it('should not authenticate (wrong email)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials('toto@example.com', account.rawPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
      it('should not authenticate (wrong password)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, 'foobar') }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
      it('should not authenticate (password mode not supported)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.MASTER_PASSWORD });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
    });

    describe('Master password', function () {
      it('should authenticate user with email and master password', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.MASTER_PASSWORD });
        return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawMasterPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.account).to.containSubset(account.toJSON());
          });
        });
      });
      it('should not authenticate (wrong email)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.MASTER_PASSWORD });
        return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials('toto@example.com', account.rawMasterPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
      it('should not authenticate (wrong master password)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.MASTER_PASSWORD });
        return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, 'foobar') }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
      it('should not authenticate (master password mode not supported)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
        return Fixtures.createAccount({ role: Roles.DEVELOPER }).then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawMasterPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
      it('should fail to authenticate if account is not a developer one', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.MASTER_PASSWORD });
        return Fixtures.createAccount({ masterPassword: 'Ago0dP@ssw0rd' }).then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawMasterPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
    });

    describe('API Key', function () {
      it('should authenticate with API key', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.API_KEY });
        return Fixtures.createClient().then(client => {
          return Fixtures.findAccountById(client.accountId).then(account => {
            const req = HTTPMocks.createRequest({
              headers: { authorization: `${Authenticator.Schemes.API_KEY} ${client.key}` }
            });
            return authenticator.authenticate(req).then(() => {
              expect(req.account).to.containSubset(account.toJSON());
              expect(req.client).to.containSubset(client.toJSON());
            });
          });
        });
      });
    });
    it('should not authenticate (wrong API key)', function () {
      const authenticator = new Authenticator({ modes: Authenticator.Modes.API_KEY });
      return Fixtures.createClient().then(() => {
        const req = HTTPMocks.createRequest({
          headers: { authorization: `${Authenticator.Schemes.API_KEY} foobar` }
        });
        return authenticator.authenticate(req).then(() => {
          throw new Error('Should not have passed');
        }).catch(err => {
          expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
        });
      });
    });
    it('should not authenticate (API key mode is not supported)', function () {
      const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
      return Fixtures.createClient().then(client => {
        const req = HTTPMocks.createRequest({
          headers: { authorization: `${Authenticator.Schemes.API_KEY} ${client.key}` }
        });
        return authenticator.authenticate(req).then(() => {
          throw new Error('Should not have passed');
        }).catch(err => {
          expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
        });
      });
    });

    describe('Session', function () {
      it('should authenticate if session is present', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.SESSION });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            session: { account: account.toJSON() }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.account).to.containSubset(account.toJSON());
          });
        });
      });
      it('should not authenticate (no session)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.SESSION });
        return authenticator.authenticate(HTTPMocks.createRequest()).then(() => {
          throw new Error('Should not have passed');
        }).catch(err => {
          expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
        });
      });
      it('should not authenticate (session mode not supported)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            session: { account: account.toJSON() }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
    });

    describe('Access Token', function () {
      it('should authenticate with access token token', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.ACCESS_TOKEN });
        return Fixtures.createAccessToken().then(accessToken => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: `${Authenticator.Schemes.BEARER} ${accessToken.id}` }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.account).to.containSubset(accessToken.account.toJSON());
          });
        });
      });
      it('should not authenticate (wrong access token)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.ACCESS_TOKEN });
        const req = HTTPMocks.createRequest({
          headers: { authorization: `${Authenticator.Schemes.BEARER} foobar` }
        });
        return authenticator.authenticate(req).then(() => {
          throw new Error('Should not have passed');
        }).catch(err => {
          expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
        });
      });
      it('should not authenticate (access token mode not supported)', function () {
        const authenticator = new Authenticator({ modes: Authenticator.Modes.PASSWORD });
        return Fixtures.createAccessToken().then(accessToken => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: `${Authenticator.Schemes.BEARER} ${accessToken.id}` }
          });
          return authenticator.authenticate(req).then(() => {
            throw new Error('Should not have passed');
          }).catch(err => {
            expect(err.statusCode).to.equal(Restypie.Codes.Unauthorized);
          });
        });
      });
    });

    describe('Modes priority and cascaded tries', function () {
      it('should authenticate with Session', function () {
        const authenticator = new Authenticator({ modes: [Authenticator.Modes.SESSION, Authenticator.Modes.PASSWORD] });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            session: { account: account.toJSON() },
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.authenticationMode).to.equal(Authenticator.Modes.SESSION);
          });
        });
      });
      it('should authenticate with Session', function () {
        const authenticator = new Authenticator({ modes: [Authenticator.Modes.PASSWORD, Authenticator.Modes.SESSION] });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            session: { account: account.toJSON() },
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.authenticationMode).to.equal(Authenticator.Modes.PASSWORD);
          });
        });
      });
      it('should authenticate with Password', function () {
        const authenticator = new Authenticator({ modes: [Authenticator.Modes.SESSION, Authenticator.Modes.PASSWORD] });
        return Fixtures.createAccount().then(account => {
          const req = HTTPMocks.createRequest({
            headers: { authorization: Authenticator.encodeBasicCredentials(account.email, account.rawPassword) }
          });
          return authenticator.authenticate(req).then(() => {
            expect(req.authenticationMode).to.equal(Authenticator.Modes.PASSWORD);
          });
        });
      });
    });
  });

  describe('#encodeBasicCredentials()', function () {
    it('should encode credentials', function () {
      expect(Authenticator.encodeBasicCredentials('foo', 'bar')).to.equal('Basic Zm9vOmJhcg==');
    });
  });

  describe('#decodeBasicCredentials()', function () {
    it('should decode credentials', function () {
      expect(Authenticator.decodeBasicCredentials('Basic Zm9vOmJhcg==')).to.deep.equal({
        identifier: 'foo',
        password: 'bar'
      });
    });
  });

  describe('#hasScheme()', function () {
    it('should return true', function () {
      expect(Authenticator.hasScheme('bearer something', Authenticator.Schemes.BEARER)).to.equal(true);
    });

    it('should return false', function () {
      expect(Authenticator.hasScheme('bearersomething', Authenticator.Schemes.BEARER)).to.equal(false);
    });
  });

  describe('#excludeScheme()', function () {
    it('should exclude scheme', function () {
      expect(Authenticator.excludeScheme('bearer something', Authenticator.Schemes.BEARER)).to.equal('something');
    });
  });

});
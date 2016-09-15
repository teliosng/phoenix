'use strict';

const Restypie = require('restypie');
const supertest = require('supertest-as-promised');
const Url = require('url');
const QueryString = require('querystring');

const app = require('../../apps/auth');
const Fixtures = require('../_utils/fixtures');
const DBHelper = require('../_utils/db-helper');
const Authenticator = require('../../classes/authenticator');

describe('Routes : auth', function () {

  beforeEach(function () {
    return DBHelper.truncate();
  });

  describe('GET /login', function () {

    it('should send back HTML', function () {
      return supertest(app)
        .get('/login')
        .expect(Restypie.Codes.OK)
        .then(res => {
          expect(res.headers['content-type']).to.match(/text\/html/);
        });
    });

  });

  describe('POST /login', function () {

    it('should login with email/password', function () {
      return Fixtures.createAccount().then(account => {
        return supertest(app)
          .post('/login')
          .send({ email: account.email, password: account.rawPassword })
          .expect(Restypie.Codes.OK)
          .then(res => {
            expect(res.body).to.containSubset({
              data: { email: account.email }
            });
          });
      });
    });

    it('should NOT login (missing email)', function () {
      return Fixtures.createAccount().then(account => {
        return supertest(app)
          .post('/login')
          .send({ password: account.rawPassword })
          .expect(Restypie.Codes.BadRequest)
          .then(res => {
            expect(res.body.message).to.match(/email/);
          });
      });
    });

    it('should NOT login (missing password)', function () {
      return Fixtures.createAccount().then(account => {
        return supertest(app)
          .post('/login')
          .send({ email: account.email })
          .expect(Restypie.Codes.BadRequest)
          .then(res => {
            expect(res.body.message).to.match(/password/);
          });
      });
    });

    it('should send back a 401 (email does not exist)', function () {
      return supertest(app)
        .post('/login')
        .send({ email: 'unexisting', password: 'password' })
        .expect(Restypie.Codes.Unauthorized);
    });

    it('should send back a 401 (wrong password)', function () {
      return Fixtures.createAccount().then(account => {
        return supertest(app)
          .post('/login')
          .send({ email: account.email, password: 'password' })
          .expect(Restypie.Codes.Unauthorized);
      });
    });

    it('should set a cookie', function () {
      return Fixtures.createAccount().then(account => {
        return supertest(app)
          .post('/login')
          .send({ email: account.email, password: account.rawPassword })
          .expect(Restypie.Codes.OK)
          .then(res => {
            const cookies = res.headers['set-cookie'];
            expect(cookies).to.have.lengthOf(1);
            expect(cookies[0]).to.match(/test\.sid/);
          });
      });
    });

  });

  describe('POST /logout', function () {

    it('should log account out / unset cookie', function () {
      return Fixtures.login().then(agent => {
        return agent
          .post('/logout')
          .set('Accept', 'application/json')
          .expect(Restypie.Codes.NoContent);
      });
    });

    it('should clear tokens', function () {
      return Fixtures.createAccessToken().then(accessToken => {
        return Fixtures.login(accessToken.account).then(agent => {
          return agent
            .post('/logout')
            .set('Accept', 'application/json')
            .expect(Restypie.Codes.NoContent)
            .then(() => {
              return Fixtures.countAccessTokens({ accountId: accessToken.accountId }).then(count => {
                expect(count).to.equal(0);
              });
            });
        });
      });
    });

  });

  describe('GET /authorize', function () {

    it('should send back a 401 if not logged in', function () {
      return supertest(app)
        .get('/authorize')
        .set('Accept', 'application/json')
        .expect(Restypie.Codes.Unauthorized);
    });

    it('should send back HTML if logged in', function () {
      return Fixtures.createClient().then(client => {
        return Fixtures.login().then(agent => {
          return agent
            .get('/authorize')
            .query({
              response_type: 'code',
              client_id: client.id
            })
            .expect(Restypie.Codes.OK)
            .expect('content-type', /text\/html/);
        });
      });
    });

    it('should send back a 400 (missing response_type)', function () {
      return Fixtures.createClient().then(client => {
        return Fixtures.login().then(agent => {
          return agent
            .get('/authorize')
            .query({
              client_id: client.id
            })
            .expect(Restypie.Codes.BadRequest)
            .then(res => {
              expect(res.body.message).to.match(/response_type/);
            });
        });
      });
    });

    it('should send back a 400 (missing client_id)', function () {
      return Fixtures.login().then(agent => {
        return agent
          .get('/authorize')
          .query({
            response_type: 'code'
          })
          .expect(Restypie.Codes.BadRequest)
          .then(res => {
            expect(res.body.message).to.match(/client_id/);
          });
      });
    });

    it('should send back a 403 if redirect_uri does not match the client\'s domain', function () {
      return Fixtures.createClient().then(client => {
        return Fixtures.login().then(agent => {
          return agent
            .get('/authorize')
            .query({
              response_type: 'code',
              client_id: client.id,
              redirect_uri: 'http://google.com'
            })
            .expect(Restypie.Codes.Forbidden)
            .then(res => {
              expect(res.body.message).to.include(client.domain);
              expect(res.body.message).to.include('http://google.com');
            });
        });
      });
    });

    it('should send back a transaction ID', function () {
      return Fixtures.createClient().then(client => {
        return Fixtures.login().then(agent => {
          return agent
            .get('/authorize')
            .set('Accept', 'application/json')
            .query({
              response_type: 'code',
              client_id: client.id
            })
            .expect(Restypie.Codes.OK)
            .then(res => {
              expect(res.body.data.transactionID).to.be.a('string');
            });
        });
      });
    });
  });

  describe('POST /authorize/decision', function () {

    it('should send back the redirection location with authorization code', function () {
      return Fixtures.getAuthorization().then(params => {
        return params.agent
          .post('/authorize/decision')
          .set('Accept', 'application/json')
          .send({ transaction_id: params.data.transactionID })
          .expect(Restypie.Codes.MovedTemporarily)
          .then(res => {
            expect(res.headers.location).to.include(params.data.client.homepage);
            const qs = QueryString.parse(Url.parse(res.headers.location).query);
            expect(qs.code).to.exist.and.be.a('string');
          });
      });
    });

    it('should return back to homepage with an error', function () {
      return Fixtures.getAuthorization().then(params => {
        return params.agent
          .post('/authorize/decision')
          .set('Accept', 'application/json')
          .send({ transaction_id: params.data.transactionID, cancel: true })
          .expect(Restypie.Codes.MovedTemporarily)
          .then(res => {
            expect(res.headers.location).to.include(params.data.client.homepage);
            const qs = QueryString.parse(Url.parse(res.headers.location).query);
            expect(qs.error).to.exist.and.equal('access_denied');
          });
      });
    });

  });

  describe('POST /token', function () {

    it('should send back a token for a valid authorization code', function () {
      return Fixtures.createAuthorizationCode().then(authorizationCode => {
        return supertest(app)
          .post('/token')
          .set('Authorization', Authenticator.encodeBasicCredentials(authorizationCode.client.key, authorizationCode.client.secret))
          .send({ code: authorizationCode.id, grant_type: 'authorization_code' })
          .expect(Restypie.Codes.OK)
          .then(res => {
            expect(res.body.access_token).to.exist.and.be.a('string');
          });
      });
    });

    it('should send back a 401 if client secret is incorrect', function () {
      return Fixtures.createAuthorizationCode().then(authorizationCode => {
        return supertest(app)
          .post('/token')
          .set('Authorization', Authenticator.encodeBasicCredentials(authorizationCode.client.key, 'wrong'))
          .set('Accept', 'application/json')
          .send({ code: authorizationCode.id, grant_type: 'authorization_code' })
          .expect(Restypie.Codes.Unauthorized);
      });
    });

    it('should send back a 401 if no corresponding code is found', function () {
      return Fixtures.createAuthorizationCode().then(authorizationCode => {
        return supertest(app)
          .post('/token')
          .set('Authorization', Authenticator.encodeBasicCredentials(authorizationCode.client.key, authorizationCode.client.secret))
          .set('Accept', 'application/json')
          .send({ code: '123', grant_type: 'authorization_code' })
          .expect(Restypie.Codes.Unauthorized);
      });
    });

    it('should send back a 401 if code is expired', function () {
      return Fixtures.createAuthorizationCode({ expiresAt: new Date(Date.now() - 1000) }).then(authorizationCode => {
        return supertest(app)
          .post('/token')
          .set('Authorization', Authenticator.encodeBasicCredentials(authorizationCode.client.key, authorizationCode.client.secret))
          .set('Accept', 'application/json')
          .send({ code: authorizationCode.id, grant_type: 'authorization_code' })
          .expect(Restypie.Codes.Unauthorized);
      });
    });

  });


});
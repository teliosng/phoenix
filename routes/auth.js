'use strict';

const Restypie = require('restypie');

const oauth2 = require('../modules/oauth2');
const Connectors = require('../connectors');
const Configurator = require('../modules/configurator');
const Authenticator = require('../classes/authenticator');
const authenticator = require('../middlewares/authenticator');
const Utils = require('../utils');

module.exports = app => {

  app.get('/me', authenticator({ modes: Authenticator.ALL_MODES }), (req, res, next) => {
    return Connectors.Account.findById(req.account.id).then(account => {
      return res.json({ data: account.toPublic() });
    }).catch(next);
  });

  /**
   *
   */
  app.get('/authorize',
    authenticator({ modes: Authenticator.Modes.SESSION }),
    oauth2.authorization({ userProperty: 'account' }, (clientId, redirectURI, done) => {
      return Connectors.Client.findById(clientId)
        .then(client => {
          if (!redirectURI) redirectURI = client.homepage;
          if (!Utils.domainMatches(redirectURI, client.domain)) {
            throw new Restypie.RestErrors.Forbidden(`Redirect uri ${redirectURI} must match domain ${client.domain}`);
          }
          return done(null, client, redirectURI);
        })
        .catch(done);
    }), (req, res) => {

      const data = {
        client: req.oauth2.client.toPublic(),
        account: req.account,
        transactionID: req.oauth2.transactionID
      };

      if (req.accepts('html')) return res.render('oauth', data);

      return res.json({ data });
    });

  /**
   *
   */
  app.post('/authorize/decision',
    authenticator({ modes: Authenticator.Modes.SESSION }),
    oauth2.decision({ userProperty: 'account' })
  );

  /**
   *
   */
  app.post('/token', authenticator({ modes: Authenticator.Modes.CLIENT_CREDENTIALS }), oauth2.token());

  /**
   *
   */
  app.get('/login', (req, res) => {
    const returnTo = req.query.returnTo;
    if (returnTo) {
      if (req.isAuthenticated) return res.redirect(returnTo);
      else req.session.returnTo = returnTo;
    } else if (req.isAuthenticated && req.session.returnTo) {
      return res.redirect(req.session.returnTo);
    }
    return res.render('login', { account: req.account });
  });

  /**
   *
   */
  app.post('/login', (req, res, next) => {
    const body = req.body;
    const email = body.email;
    const password = body.password;

    if (!email) return next(new Restypie.RestErrors.BadRequest('Missing email to login'));
    if (!password) return next(new Restypie.RestErrors.BadRequest('Missing password to login'));

    // TODO Move this into Authenticator ?

    return Connectors.Account.findOne({ email }).then(account => {
      if (!account) return next(new Restypie.RestErrors.Unauthorized(`Couldn't find account with email ${email}`));

      return Connectors.Account.compareKeys(password, account.password).then(matches => {
        if (!matches) return next(new Restypie.RestErrors.Unauthorized('Incorrect email or password'));

        req.account = req.session.account = account.toPublic();

        Object.assign(req.session.cookie, {
          maxAge: Configurator.get('auth').maxAge,
          domain: Configurator.get('auth').domain
        });

        return res.status(Restypie.Codes.OK).json({
          data: req.account,
          returnTo: req.session.returnTo || null
        });
      });
    }).catch(next);
  });

  app.post('/logout', authenticator({ modes: Authenticator.ALL_MODES }), (req, res, next) => {
    if (!req.isAuthenticated) return res.status(Restypie.Codes.Accepted).end();
    return Connectors.AccessToken.remove({ accountId: req.account.id }).then(() => {
      return req.session.destroy(err => {
        if (err) return next(err);
        return res.status(Restypie.Codes.NoContent).end();
      });
    }).catch(next);
  });

};
'use strict';

const Restypie = require('restypie');
const request = require('request-promise');

const Connectors = require('../connectors');
const Configurator = require('../modules/configurator');

const CLIENT_NAME = 'mediabucket-example';
const HOST = Configurator.get('hosts').EXAMPLE;

module.exports = app => {

  app.get('/', (req, res, next) => {
    return Connectors.Client.findOne({ name: CLIENT_NAME }).then(client => {
      return (() => {
        if (client) return Promise.resolve(client);
        return Connectors.Account.findById(1).then(account => {
          return Connectors.Client.create({
            name: CLIENT_NAME,
            domain: HOST,
            homepage: Restypie.Url.join(HOST, '/home'),
            accountId: account.id
          });
        });
      })().then(client => {
        return res.render('example-index', { client, authHost: Configurator.get('hosts').AUTH });
      });
    }).catch(next);
  });

  app.get('/home', (req, res) => {
    if (req.query.error) return res.render('example-home', { denied: true });

    const code = req.query.code;

    return Connectors.Client.findOne({ name: CLIENT_NAME }).then(client => {
      if (!client) res.redirect('/');
      return request({
        method: Restypie.Methods.POST,
        url: Restypie.Url.join(Configurator.get('hosts').AUTH, '/token'),
        headers: {
          Authorization: `BASIC ${new Buffer(`${client.id}:${client.secret}`).toString('base64')}`,
          Accept: 'application/json'
        },
        body: { code, grant_type: 'authorization_code' },
        json: true
      }).then(body => {
        return res.render('example-home', { token: body.access_token, authHost: Configurator.get('hosts').AUTH });
      });
    }).catch(() => res.redirect('/'));
  });

};
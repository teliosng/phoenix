'use strict';

/* eslint-disable max-params */

const OAuth2Orize = require('oauth2orize');
const Restypie = require('restypie');

const Connectors = require('../connectors');

const server = OAuth2Orize.createServer();

server.serializeClient((client, done) => {
  return done(null, client.id);
});

server.deserializeClient((id, done) => {
  return Connectors.Client.findById(id).then(client => {
    return done(null, client);
  }).catch(done);
});

server.grant(OAuth2Orize.grant.code((client, redirectURI, account, ares, done) => {
  return Connectors.AuthorizationCode.create({ clientId: client.id, redirectURI, accountId: account.id })
    .then(authorizationCode => done(null, authorizationCode.id))
    .catch(done);
}));


server.grant(OAuth2Orize.grant.token((client, account, ares, done) => {
  return Connectors.AccessToken.create({ clientId: client.id, accountId: account.id })
    .then(accessToken => done(null, accessToken.id))
    .catch(done);
}));

server.exchange(OAuth2Orize.exchange.code({ userProperty: 'client' }, (client, code, redirectURI, done) => {
  return Connectors.AuthorizationCode.findById(code, ['active'])
    .then(authorizationCode => {
      if (!authorizationCode || client.id !== authorizationCode.clientId || redirectURI !== authorizationCode.redirectURI) {
        return done(new Restypie.RestErrors.Unauthorized());
      }

      return Connectors.AccessToken.create({
        clientId: client.id,
        accountId: authorizationCode.accountId
      }).then(accessToken => done(null, accessToken.id));
    })
    .catch(done);
}));


// server.exchange(OAuth2Orize.exchange.password({ userProperty: 'client' }, (client, email, password, scope, done) => {
//   return Models.Client.findById(client.id)
//     .then((existingClient) => {
//       if (!existingClient) return done(null, false);
//       if (client.secret !== existingClient.secret) return done(null, false);
//       return Models.User.findOne({ where: { email } })
//         .then((user) => {
//           if (!user) return done(null, false);
//           if (password !== user.password) return done(null, false);
//           return Utils.generateToken(TOKEN_SIZE)
//             .then((token) => {
//               return Models.AccessToken.create({
//                 token,
//                 clientId: client.id,
//                 userId: user.id
//               })
//                 .then(() => done(null, token));
//             });
//         });
//     })
//     .catch(done);
// }));


// server.exchange(OAuth2Orize.exchange.clientCredentials({ userProperty: 'client' }, (client, scope, done) => {
//   return Models.Client.findById(client.id)
//     .then((existingClient) => {
//       if (!existingClient) return done(null, false);
//       if (client.secret !== existingClient.secret) return done(null, false);
//       return Utils.generateToken(TOKEN_SIZE)
//         .then((token) => {
//           return Models.AccessToken.create({
//             token,
//             clientId: client.id
//           })
//             .then(() => done(null, token));
//         });
//     })
//     .catch(done);
// }));


module.exports = server;

/* eslint-enable max-params */
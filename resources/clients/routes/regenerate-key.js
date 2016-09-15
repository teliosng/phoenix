'use strict';

const Restypie = require('restypie');

const Authenticator = require('../../../classes/authenticator');
const Connectors = require('../../../connectors');
const Roles = require('../../../constants/roles');

class RegenerateKeyRoute extends Restypie.Route {
  get method() { return Restypie.Methods.PATCH; }
  get path() { return '/:id/regenerate-key'; }
  handler(bundle) {
    const resource = this.context.resource;
    const id = parseInt(bundle.params.id, 10);
    const pipeline = bundle.createPipeline(resource.exit, resource);

    return pipeline
      .add(bundle => {
        return Connectors.Client.findById(id).then(client => {
          if (!client) return bundle.next(new Restypie.RestErrors.NotFound(`Could not find client with id: ${id}`));

          const canRegenerate = bundle.req.account.role === Roles.ADMIN ||
            (bundle.req.authenticationMode === Authenticator.Modes.MASTER_PASSWORD &&
            client.accountId === bundle.req.account.id);

          if (!canRegenerate) {
            return bundle.next(new Restypie.RestErrors.Forbidden(`Only owner with master password can regenerate key for client ${id}`));
          }

          return client.regenerateKey().then(updated => {
            client = client.toPublic();
            client.key = updated.key;
            return bundle.setData(client).setStatusCode(Restypie.Codes.OK).next();
          });
        });
      })
      .run();
  }
}

module.exports = RegenerateKeyRoute;
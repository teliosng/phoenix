'use strict';

const Restypie = require('restypie');

const Connectors = require('../../../connectors');
const Roles = require('../../../constants/roles');

class ActivateDeveloperAccountRoute extends Restypie.Route {
  get method() { return Restypie.Methods.PATCH; }
  get path() { return '/:id/activate-developer-account'; }

  handler(bundle) {
    const resource = this.context.resource;
    const pipeline = bundle.createPipeline(resource.exit, resource);

    const id = parseInt(bundle.params.id, 10);
    const account = bundle.req.account;

    return pipeline
      .add(bundle => {
        if (account.role !== Roles.ADMIN && account.id !== id) {
          throw new Restypie.RestErrors.Forbidden(`Only account ${id} or admin accounts can activate this account.`);
        }
        return bundle.next();
      })
      .add(bundle => {
        return resource.parseBody(bundle);
      })
      .add(bundle => {
        const masterPassword = bundle.body.masterPassword;
        if (!masterPassword) throw new Restypie.RestErrors.BadRequest('Missing masterPassword.');
        return Connectors.Account.activateDeveloperAccount(id, masterPassword);
      })
      .add(bundle => {
        return bundle.setStatusCode(Restypie.Codes.NoContent).next();
      })
      .run();
  }
}

module.exports = ActivateDeveloperAccountRoute;
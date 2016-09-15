'use strict';

const Restypie = require('restypie');

const ConnectorResource = require('../../classes/connector-resource');
const Connectors = require('../../connectors');

const ActivateDeveloperAccountRoute = require('./routes/activate-developer-account');


class AccountsResource extends ConnectorResource {
  get connector() { return Connectors.Account; }
  get path() { return 'accounts'; }
  get routes() {
    return [
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.PostRoute,
      Restypie.BasicRoutes.OptionsRoute,
      ActivateDeveloperAccountRoute
    ];
  }
  get schema() {
    return {
      id: {
        type: 'int',
        isPrimaryKey: true,
        isFilterable: true
      },
      email: {
        type: String,
        isWritableOnce: true,
        isReadable: true
      },
      password: {
        type: String,
        isWritableOnce: true
      },
      masterPassword: {
        type: String
      }
    };
  }

}


module.exports = AccountsResource;
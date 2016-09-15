'use strict';

const Restypie = require('restypie');

const ConnectorResource = require('../../classes/connector-resource');
const Connectors = require('../../connectors');
const HomepageField = require('./fields/homepage');
const v1 = require('../../apis/v1');
const Authenticator = require('../../classes/authenticator');
const ClientTypes = require('../../constants/client-types');
const ClientStates = require('../../constants/client-states');

const RegenerateKeyRoute = require('./routes/regenerate-key');

class ClientsResource extends ConnectorResource {
  get connector() { return Connectors.Client; }
  get path() { return 'clients'; }
  get routes() {
    return [
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.GetManyRoute,
      Restypie.BasicRoutes.PostRoute,
      Restypie.BasicRoutes.OptionsRoute,
      RegenerateKeyRoute,
      Restypie.BasicRoutes.DeleteSingleRoute,
      Restypie.BasicRoutes.PatchSingleRoute
    ];
  }
  get defaultSelect() {
    return [
      'id',
      'name',
      'domain',
      'homepage',
      'accountId',
      'type',
      'state',
      'desc',
      'longDesc',
      'logo',
      'tags',
      'supportEmail',
      'termsOfUseUrl',
      'privacyPolicyUrl'
    ];
  }
  get schema() {
    return {
      id: {
        type: 'int',
        isPrimaryKey: true,
        isFilterable: true
      },

      type: {
        type: String,
        enum: ClientTypes.values,
        isWritableOnce: true,
        isFilterable: true
      },

      state: {
        type: String,
        enum: ClientStates.values,
        isWritable: true,
        isFilterable: true
      },

      name: {
        type: String,
        isRequired: true,
        isFilterable: true
      },

      domain: {
        type: String,
        pattern: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/, // eslint-disable-line no-useless-escape
        isRequired: true,
        isFilterable: true
      },

      homepage: {
        type: HomepageField,
        isRequired: true,
        isReadable: true
      },

      key: {
        type: String,
        isReadable: true
      },

      secret: {
        type: String
      },

      accountId: {
        type: 'int',
        isFilterable: true
      },

      createdAt: {
        type: Date,
        isFilterable: true
      },

      account: {
        type: Restypie.Fields.ToOneField,
        fromKey: 'accountId',
        to: () => v1.resources.accounts
      },

      desc: {
        type: String,
        isWritable: true,
        isReadable: true
      },

      longDesc: {
        type: String,
        isWritable: true,
        isReadable: true
      },

      logo: {
        type: Restypie.Fields.FileField,
        isWritable: true,
        isReadable: true
      },

      tags: {
        type: String,
        isWritable: true,
        isReadable: true
      },

      supportEmail: {
        type: String,
        isWritable: true,
        isReadable: true
      },

      termsOfUseUrl: {
        type: String,
        isWritable: true,
        isReadable: true
      },

      privacyPolicyUrl: {
        type: String,
        isWritable: true,
        isReadable: true
      }
    };
  }
  beforeDehydrate(bundle) {
    if (bundle.isRead && bundle.select.includes('key') && bundle.req.authenticationMode !== Authenticator.Modes.MASTER_PASSWORD) {
      return bundle.next(new Restypie.RestErrors.Forbidden(`Master password authentication is required to display the API key`));
    }
    return bundle.next();
  }
  afterValidate(bundle) {
    if (bundle.isWrite && !bundle.isUpdate) {
      bundle.body.accountId = bundle.req.account.id;
    }
    return bundle.next();
  }

}


module.exports = ClientsResource;
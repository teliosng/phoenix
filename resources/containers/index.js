'use strict';

const Restypie = require('restypie');

const Models = require('../../models');


class ContainersResource extends Restypie.Resources.SequelizeResource {
  get model() { return Models.Container; }
  get path() { return 'containers'; }
  get routes() {
    return [
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.GetManyRoute
    ];
  }
  get schema() {
    return {
      id: {
        type: 'int',
        isPrimaryKey: true,
        isFilterable: true
      },
      path: {
        type: String,
        isReadable: true
      }
    };
  }
}


module.exports = ContainersResource;
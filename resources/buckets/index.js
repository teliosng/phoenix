'use strict';

const Restypie = require('restypie');

const Models = require('../../models');
const v1 = require('../../apis/v1');

class BucketsResource extends Restypie.Resources.SequelizeResource {
  get model() { return Models.Bucket; }
  get path() { return 'buckets'; }
  get routes() {
    return [
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.GetManyRoute,
      Restypie.BasicRoutes.OptionsRoute
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
      },
      containerId: {
        type: String,
        isReadable: true
      },
      container: {
        type: Restypie.Fields.ToOneField,
        isReadable: true,
        fromKey: 'containerId',
        to() { return v1.resources.containers; }
      }
    };
  }
}

module.exports = BucketsResource;
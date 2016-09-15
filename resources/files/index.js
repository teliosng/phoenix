'use strict';

const Restypie = require('restypie');

const Models = require('../../models');
const v1 = require('../../apis/v1');


class FilesResource extends Restypie.Resources.SequelizeResource {
  get model() { return Models.File; }
  get path() { return 'files'; }
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
      bucketId: {
        type: 'int',
        isFilterable: true
      },
      bucket: {
        type: Restypie.Fields.ToOneField,
        isFilterable: true,
        fromKey: 'bucketId',
        to() { return v1.resources.buckets; }
      },
      size: {
        type: 'int',
        isFilterable: true
      },
      name: {
        type: String,
        isFilterable: true
      },
      extension: {
        type: String,
        isFilterable: true
      }
    };
  }
}

module.exports = FilesResource;
'use strict';

const Restypie = require('restypie');

const Models = require('../../models');
const v1 = require('../../apis/v1');


class AttributesResource extends Restypie.Resources.SequelizeResource {
  get model() { return Models.Attribute; }
  get path() { return 'attributes'; }
  get routes() {
    return [
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.GetManyRoute,
      Restypie.BasicRoutes.OptionsRoute,
      class extends Restypie.BasicRoutes.PostRoute { get allowMany() { return true; } }
    ];
  }
  get schema() {
    return {
      id: {
        type: 'int',
        isPrimaryKey: true,
        isFilterable: true
      },
      fileId: {
        type: 'int',
        isWritable: true,
        isFilterable: true
      },
      file: {
        type: Restypie.Fields.ToOneField,
        isFilterable: true,
        fromKey: 'fileId',
        to() { return v1.resources.files; }
      },
      mediaId: {
        type: 'int',
        isWritable: true,
        IsFilterable: true,
        to() { return v1.resources.medias; }
      }
    };
  }
}

module.exports = AttributesResource;
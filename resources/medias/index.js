'use strict';

const Restypie = require('restypie');

const Models = require('../../models');
const v1 = require('../../apis/v1');


class MediasResource extends Restypie.Resources.SequelizeResource {
  get model() { return Models.Media; }
  get path() { return 'medias'; }
  get routes() {
    return [
      Restypie.BasicRoutes.GetSingleRoute,
      Restypie.BasicRoutes.GetManyRoute,
      Restypie.BasicRoutes.OptionsRoute
      // TODO How to create medias ?
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
        isReadable: true
      },
      file: {
        type: Restypie.Fields.ToOneField,
        isReadable: true,
        fromKey: 'fileId',
        to() { return v1.resources.files; }
      },
      attributes: {
        type: Restypie.Fields.ToManyField,
        isReadable: true,
        to() { return v1.resources.attributes; }
      },
      createdAt: {
        type: Date,
        isFilterable: true
      }
    };
  }
}


module.exports = MediasResource;
'use strict';

const mediaDefinition = require('./lib/media-definition');

module.exports = function (db, dataTypes) {

  const MasterMedia = db.define('MasterMedia', Object.assign({

    imdbId: {
      type: dataTypes.STRING,
      allowNull: true
    }

  }, mediaDefinition), {

    tableName: 'master_medias'

  });

  return MasterMedia;

};
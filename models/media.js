'use strict';

const mediaDefinition = require('./lib/media-definition');

module.exports = function (db) {

  const Media = db.define('Media', mediaDefinition, {

    tableName: 'medias'

  });

  return Media;

};
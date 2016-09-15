'use strict';

const mediaDefinition = require('./lib/media-definition');

module.exports = function (db, dataTypes) {

  const UserMedia = db.define('UserMedia', Object.assign({

    masterId: {
      type: dataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }

  }, mediaDefinition), {

    tableName: 'user_medias'

  });

  return UserMedia;

};
'use strict';

const Roles = require('../constants/roles');

function createTables(queryInterface, dataTypes) {
  return Promise.all([
    queryInterface.createTable('accounts', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      email: {
        type: dataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      password: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      role: {
        type: dataTypes.ENUM(Roles.values),
        allowNull: false,
        defaultValue: Roles.USER
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('containers', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      path: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('buckets', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      path: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      accountId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      containerId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('user_medias', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      accountId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      fileId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      type: {
        type: dataTypes.ENUM('movie', 'tv_show', 'episode', 'track'),
        allowNull: false
      },

      masterId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: true
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('master_medias', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      accountId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      fileId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      type: {
        type: dataTypes.ENUM('movie', 'tv_show', 'episode', 'track'),
        allowNull: false
      },

      imdbId: {
        type: dataTypes.STRING,
        allowNull: true
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('files', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      bucketId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      path: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      name: {
        type: dataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      extension: {
        type: dataTypes.STRING(5),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      format: {
        type: dataTypes.STRING(10),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      size: {
        type: dataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 1
        }
      },

      quality: {
        type: dataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('attributes', {

      id: {
        type: dataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      mediaId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      fileId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('clients', {

      id: {
        type: dataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      name: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      domain: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      homepage: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      secret: {
        type: dataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      accountId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('authorization_codes', {

      id: {
        type: dataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      accountId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      clientId: {
        type: dataTypes.STRING,
        allowNull: false
      },

      expiresAt: {
        type: dataTypes.DATE,
        allowNull: false
      }

    }, {
      charset: 'utf8'
    }),

    queryInterface.createTable('access_tokens', {

      id: {
        type: dataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      clientId: {
        type: dataTypes.STRING,
        allowNull: true
      },

      accountId: {
        type: dataTypes.INTEGER.UNSIGNED,
        allowNull: true
      }

    }, {
      charset: 'utf8'
    })

  ]);
}

function addTimestamps(db, utils) {
  return Promise.all([
    'accounts',
    'clients',
    'access_tokens',
    'authorization_codes',
    'buckets',
    'containers',
    'files',
    'master_medias',
    'user_medias',
    'attributes'
  ].map(table => {
    return db.query(utils.addTimestampsQuery(table));
  }));
}


function addConstraints(db, utils) {
  return Promise.all([
    utils.addConstraintQuery('buckets', 'accountId', 'accounts'),
    utils.addConstraintQuery('buckets', 'containerId', 'containers'),
    utils.addConstraintQuery('files', 'bucketId', 'buckets'),
    utils.addConstraintQuery('attributes', 'fileId', 'files'),
    utils.addConstraintQuery('attributes', 'mediaId', 'user_medias'),
    utils.addConstraintQuery('master_medias', 'accountId', 'accounts'),
    utils.addConstraintQuery('master_medias', 'fileId', 'files'),
    utils.addConstraintQuery('user_medias', 'accountId', 'accounts'),
    utils.addConstraintQuery('user_medias', 'fileId', 'files'),
    utils.addConstraintQuery('user_medias', 'masterId', 'master_medias'),
    utils.addConstraintQuery('access_tokens', 'accountId', 'accounts'),
    utils.addConstraintQuery('access_tokens', 'clientId', 'clients'),
    utils.addConstraintQuery('authorization_codes', 'accountId', 'accounts'),
    utils.addConstraintQuery('authorization_codes', 'clientId', 'clients')
  ].map(q => db.query(q)));
}

function createMediaView(db) {
  return db.query(`
    CREATE VIEW medias AS
    SELECT id, accountId, fileId, type, createdAt, updatedAt
    FROM user_medias
    WHERE masterId IS NULL
    UNION
    SELECT id, accountId, fileId, type, createdAt, updatedAt
    FROM master_medias
    UNION
    SELECT um.id, um.accountId, mm.fileId, mm.type, um.createdAt, um.updatedAt
    FROM user_medias um
    JOIN master_medias mm
    ON um.masterId = mm.id
    WHERE um.masterId IS NOT NULL;
  `);
}

module.exports = {
  up(queryInterface, dataTypes, db, utils) {
    return createTables(queryInterface, dataTypes)
      .then(addTimestamps.bind(null, db, utils))
      .then(addConstraints.bind(null, db, utils))
      .then(createMediaView.bind(null, db));
  },

  down() {
    return Promise.reject(new Error('Initial migration cannot be reverted, just reset the DB if you want to do so.'));
  }
};
'use strict';

module.exports = {
  up(queryInterface, dataTypes) {
    return Promise.all([
      queryInterface.addColumn('clients', 'desc', {
        type: dataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('clients', 'longDesc', {
        type: dataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn('clients', 'logo', {
        type: dataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('clients', 'tags', {
        type: dataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('clients', 'supportEmail', {
        type: dataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('clients', 'termsOfUseUrl', {
        type: dataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('clients', 'privacyPolicyUrl', {
        type: dataTypes.STRING,
        allowNull: true
      })
    ]);
  },

  down(queryInterface) {
    return Promise.all([
      queryInterface.removeColumn('clients', 'desc'),
      queryInterface.removeColumn('clients', 'longDesc'),
      queryInterface.removeColumn('clients', 'logo'),
      queryInterface.removeColumn('clients', 'tags'),
      queryInterface.removeColumn('clients', 'supportEmail'),
      queryInterface.removeColumn('clients', 'termsOfUseUrl'),
      queryInterface.removeColumn('clients', 'privacyPolicyUrl')
    ]);
  }
};
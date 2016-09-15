'use strict';

const env = process.env;

module.exports = {

  default: {
    host: env.SQL_HOST || 'localhost',
    user: env.SQL_USER || 'root',
    password: env.SQL_PASSWORD || '',
    port: env.SQL_PORT || 3306,
    name: env.SQL_NAME || 'media_bucket'
  },

  staging: {
    host: env.SQL_HOST || 'main-staging.cklku8zjuyjm.us-west-1.rds.amazonaws.com',
    user: env.SQL_USER || 'staging',
    password: env.SQL_PASSWORD || 'youllnotfind',
    name: env.SQL_NAME || 'staging'
  },

  dev: {
  },

  test: {
    name: 'media_bucket_test'
  }

};
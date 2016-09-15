'use strict';

const Restypie = require('restypie');
const _ = require('lodash');

const SequelizeConnector = require('./sequelize-connector');

/**
 * Connector based Restypie resource
 */
class ConnectorResource extends Restypie.Resources.AbstractResource {
  /**
   * The connector to communicate with.
   *
   * @type {SequelizeConnector}
   * @abstract
   */
  get connector() {
    throw new Error(`${this.constructor.name} requires a "connector"`);
  }

  /**
   * Whether or not the resource supports unique constraints. Mainly used for test purpose.
   *
   * @type {boolean}
   */
  get supportsUniqueConstraints() {
    return true;
  }

  /**
   * Whether or not the resource supports upsert. Note : "supporting" is not "enabling".
   *
   * @type {boolean}
   */
  get supportsUpserts() {
    return true;
  }

  constructor(api) {
    super(api);
    if (!(this.connector.prototype instanceof SequelizeConnector)) {
      throw new Error(`${this.constructor.name} requires a "connector"`);
    }
  }

  /**
   * Counts records.
   *
   * @param {Restypie.Bundle} bundle
   * @returns {Promise.<number>}
   */
  countObjects(bundle) {
    return this.connector.count(ConnectorResource.formatFilters(bundle.filters))
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Creates a record.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise.<Object>}
   */
  createObject(bundle, options = {}) {
    return this.connector.create(bundle.body, options)
      .then(object => object.toJSON())
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Creates multiple records.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<Object[]>}
   */
  createObjects(bundle, options = {}) {
    return Promise.all(bundle.body.map(props => {
      return this.createObject({ body: props }, options);
    }));
  }

  /**
   * Retrieves records.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<Object[]>}
   */
  getObjects(bundle, options = {}) {
    if (bundle.select) {
      options.attributes = bundle.select;
    }

    if (bundle.sort) {
      options.order = ConnectorResource.toOrder(bundle.sort);
    }

    if (bundle.limit) {
      options.limit = bundle.limit;
    }

    if (bundle.offset) {
      options.offset = bundle.offset;
    }

    return this.connector.find(ConnectorResource.formatFilters(bundle.filters), options)
      .then(objects => objects.map(object => object.toJSON()))
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Retrieves a single record.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  getObject(bundle, options = {}) {
    if (bundle.select) options.attributes = bundle.select;

    return this.connector.findOne(ConnectorResource.formatFilters(bundle.filters), options)
      .then(object => object && object.toJSON())
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Updates a record.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<number>}
   */
  updateObject(bundle, options = {}) {
    return this.connector.update(ConnectorResource.formatFilters(bundle.filters), bundle.body, options)
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Updates multiple records.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<number>}
   */
  updateObjects(bundle, options = {}) {
    return this.connector.update(ConnectorResource.formatFilters(bundle.filters), bundle.body, options)
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Deletes a record.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<number>}
   */
  deleteObject(bundle, options = {}) {
    return this.connector.remove(ConnectorResource.formatFilters(bundle.filters), options)
      .catch(this.mapErrors.bind(this));
  }

  /**
   * Deletes multiple records.
   *
   * @param {Restypie.Bundle} bundle
   * @param {Object} [options]
   * @returns {Promise<number>}
   */
  upsertObject(bundle, options = {}) {
    const filters = bundle.filters;
    const body = Object.assign({}, bundle.body);

    for (const key of Object.keys(filters)) {
      if (filters[key].eq) {
        body[key] = filters[key].eq;
      }
    }

    const getTransaction = then => {
      if (options.transaction) return then(options.transaction);
      return this.connector.model.modelManager.sequelize.transaction(then);
    };

    return getTransaction(transaction => {
      return this.connector.findOne(ConnectorResource.formatFilters(bundle.filters), {
        transaction,
        attributes: [this.primaryKeyField.path]
      }).then(exists => {
        if (exists) {
          return this.updateObject(bundle, { transaction }).then(() => {
            return this.getObject({
              filters: { [this.primaryKeyField.path]: exists[this.primaryKeyField.path] }
            }, { transaction }).then(object => {
              return Promise.resolve({ isCreated: false, object });
            });
          });
        }
        return this.createObject(bundle, { transaction }).then(object => {
          return Promise.resolve({ isCreated: true, object });
        });
      });
    });
  }

  /**
   * Returns the `key` corresponding to `path` from the resource's fields. If none is found, it means the field is not
   * mapped in the schema. In this case `path` is returned as a default.
   *
   * @param path
   * @returns {String|undefined|*}
   */
  getKeyFromSequelizeErrorPath(path) {
    return this.fieldPathToKey(path) || path;
  }

  /**
   * Maps Sequelize errors to Restypie ones.
   *
   * @param {Error} err
   * @returns {Promise<Error>}
   */
  mapErrors(err) {
    let keys;
    let firstErr;
    const fieldsByPath = this.fieldsByPath;

    switch (err.name) {
      case 'SequelizeValidationError':
        firstErr = err.errors[0];

        if (/notNull Violation/gi.test(firstErr.type)) {
          err = new Restypie.TemplateErrors.Missing({ key: this.getKeyFromSequelizeErrorPath(firstErr.path) });
        } else if (/Validation min failed/gi.test(firstErr.value.message)) {
          err = new Restypie.TemplateErrors.OutOfRange({
            key: this.getKeyFromSequelizeErrorPath(firstErr.path),
            min: _.get(this.connector.model.attributes[firstErr.path], 'validate.min')
          });
        } else if (/Validation max failed/gi.test(firstErr.value.message)) {
          err = new Restypie.TemplateErrors.OutOfRange({
            key: this.getKeyFromSequelizeErrorPath(firstErr.path),
            min: _.get(this.connector.model.attributes[firstErr.path], 'validate.max')
          });
        } else {
          err = new Restypie.RestErrors.BadRequest(firstErr.message);
        }

        break;

      case 'SequelizeUniqueConstraintError':
        keys = err.errors.reduce((acc, subErr) => {
          let value = subErr.value;
          const field = fieldsByPath[subErr.path];
          try {
            value = field.hydrate(value);
          } catch (ex) {
            // Nothing we can do, the field exists in the DB, but is not described in the schema
          }
          acc[this.getKeyFromSequelizeErrorPath(subErr.path)] = value;
          return acc;
        }, {});
        err = new Restypie.TemplateErrors.UniquenessConstraintViolation({ keys });
        break;

      /* istanbul ignore next: just here to make Eslint happy */
      default:
        /* istanbul ignore next */
        break;
    }

    return Promise.reject(err);
  }

  /**
   * Removes all records. Test purpose only. Restypie first checks the env before calling this.
   *
   * @returns {Promise}
   * @private
   */
  __reset() {
    return this.connector.remove({ [this.primaryKeyPath]: { $ne: null } });
  }

  /**
   * Translates Restypie's filters into Sequelize ones.
   *
   * @param {Object} filters
   * @returns {Object}
   */
  static formatFilters(filters = {}) {
    const equalityOperator = this.EQUALITY_OPERATOR;

    for (const key of Object.keys(filters)) {
      const filter = filters[key];

      if (filter && filter[equalityOperator]) {
        filters[key] = filter[equalityOperator];
      }

      if (filter && filter.nin) {
        filter.notIn = filter.nin;
        delete filter.nin;
      }
    }

    return filters;
  }

  /**
   * Translates Restypie's `sort` into Sequelize's `order`.
   *
   * @param {string[]} sort
   * @returns {string[][]}
   */
  static toOrder(sort) {
    return sort.map(key => {
      const isDesc = /^-/.test(key);
      if (isDesc) {
        key = key.replace(/^-/, '');
      }
      return [key, isDesc ? 'DESC' : 'ASC'];
    });
  }
}


module.exports = ConnectorResource;
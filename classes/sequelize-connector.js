'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const _ = require('lodash');
const isEqual = require('is-equal');

/**
 * AbstractSequelizeConnector
 *
 * This connector provides an OOP layer over a Sequelize model, allowing model inheritance.
 */
class AbstractSequelizeConnector {
  /**
   * Is the instance a new one - aka does it exist in database ?
   *
   * @type {boolean}
   */
  get isNew() {
    return typeof this._isNew === 'boolean' ? this._isNew : !this.id;
  }

  get isUpdate() {
    return this._isUpdate;
  }

  /**
   * @param {Object} data
   * @param {boolean} [isNew]
   * @constructor
   */
  constructor(data, isNew) {
    assert(new.target !== AbstractSequelizeConnector, 'Connector is abstract and cannot be instantiated.');
    assert(typeof data === 'object', `A ${this.constructor.name} requires data during construction !`);

    // Build an instance from... an instance
    if (data instanceof AbstractSequelizeConnector) {
      data = data.toJSON();
    }

    if (this.constructor.isDiscriminatedConnector && this.constructor.hasDiscriminatorValue) {
      data[this.constructor.discriminatorKey] = this.constructor.discriminatorValue;
    }

    if (this.constructor.getDiscriminatedConnector(data[this.constructor.discriminatorKey]) !== this.constructor) {
      return this.constructor.createDiscriminatedInstance(data);
    }

    this._initData(data, isNew);

    return this;
  }

  /**
   * Returns a JSON representation of the instance.
   *
   * @returns {Object}
   */
  toJSON() {
    return _.cloneDeep(this._data);
  }

  toInitialJSON() {
    return _.cloneDeep(this._initialData);
  }

  /**
   * Sets "value" for "key" in the instance's own data. Will register "key" as a data property if not yet registered.
   * Will record an entry in the history unless "markModified" is false.
   *
   * @param {string|Object} key
   * @param {*|boolean} [value]
   * @param {boolean} [markModified = true]
   */
  set(key, value, markModified = true) {
    if (_.isPlainObject(key)) {
      Object.keys(key).forEach(k => this.set(k, key[k], value));
      return this;
    }

    if (!(key in this._data)) {
      Object.defineProperty(this, key, {
        get() {
          return this.get(key);
        },
        set(val) {
          this.set(key, val, true);
        },
        configurable: true,
        enumerable: true
      });
    }

    if (markModified) {
      this._record(key, this._data[key], value);
    }

    this._data[key] = value;

    return this;
  }

  /**
   * Retrieves a value from the instance's own data.
   *
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this._data[key];
  }

  has(key, exists) {
    const has = key in this._data;
    if (exists) return has && !_.isNil(this.get(key));
    return has;
  }

  /**
   * If "key" is passed, returns whether or not the value for "key" has changed. Otherwise returns whether or not any
   * of the instance's own data has changed.
   *
   * @param {string} [key]
   * @returns {boolean}
   */
  isModified(key = undefined) {
    if (!key) {
      return this._history.length > 0;
    }
    return this._history.some(entry => entry.key === key);
  }

  /**
   * Returns a subset of the instance's own data which contains only modified keys/values.
   *
   * @returns {Object}
   */
  getModified() {
    return Object.keys(this._data).reduce((acc, key) => {
      if (this.isModified(key)) {
        acc[key] = this.get(key);
      }
      return acc;
    }, {});
  }

  /**
   * Either creates or updates the instance into the database. Will ensure the instance has fresh initial values and no
   * more history.
   *
   * @param {Object} [options]
   * @returns {AbstractSequelizeConnector|Object}
   */
  save(options = {}) {
    const promise = this.isNew ?
      this.constructor.create(this.toJSON(), Object.assign({}, options, { raw: true })) :
      this.isModified() ?
        this.constructor.update({ id: this.id }, this, options) :
        Promise.resolve();

    return promise.then(() => {
      this._initData(this.toJSON(), false);
      return options.raw ? this.toJSON() : this;
    });
  }

  ensureProperties(...keys) {
    const attributes = keys.filter(key => !this.has(key));
    if (!attributes.length || this.isNew || !this.has('id')) return Promise.resolve();
    return this.constructor.findById(this.id, { attributes }).then(sub => this.set(sub));
  }

  /**
   * Creates/resets data, initial data and history. Call this each time the instance is saved in the database.
   *
   * @param {Object} data
   * @param {boolean} [isNew]
   * @private
   */
  _initData(data, isNew) {
    this._data = {};
    this._initialData = _.cloneDeep(data);
    this._history = [];

    if (typeof isNew === 'boolean') {
      this._isNew = isNew;
    }

    this.set(data, false);
  }

  /**
   * Resets the history for "key".
   *
   * @param {string} key
   * @private
   */
  _resetHistory(key) {
    this._history.forEach((entry, index) => {
      if (entry.key === key) {
        this._history.splice(index, 1);
      }
    });
  }

  /**
   * Records a change in the history. Will not record any change if "previousValue" and "value" are deeply equal. Will
   * reset the history for "key" if "value" is back to the initial value for "key".
   *
   * @param {string} key
   * @param {*} previousValue
   * @param {*} value
   * @private
   */
  _record(key, previousValue, value) {
    if (isEqual(previousValue, value)) {
      return; // Do nothing if value did not change
    }

    if (isEqual(this._initialData[key], value)) {
      this._resetHistory(key); // Reset history if value is back to what it was initially
    } else {
      this._history.push({ key, previousValue, value });
    }
  }

  /**
   * Sequelize model to connect to.
   *
   * @type {Sequelize.Model}
   * @abstract
   */
  static get model() {
    throw new Error(`${this.name} requires a model`);
  }

  /**
   * Whether or not the connector has a discriminator value. Usually true for subclasses.
   *
   * @type {boolean}
   */
  static get hasDiscriminatorValue() {
    return this.discriminatorValue !== undefined;
  }

  /**
   * Value to discriminate.
   *
   * @type {*}
   * @readOnly
   */
  static get discriminatorValue() {
    return this[this.discriminatorKey];
  }

  /**
   * Whether or not this connector is discriminated.
   *
   * @type {boolean}
   * @readOnly
   */
  static get isDiscriminatedConnector() {
    return !!this.discriminatorKey;
  }


  /**
   * Key on which discrimination is based.
   *
   * @type {string}
   * @abstract
   */
  static get discriminatorKey() {
    return null;
  }

  /**
   * Discriminates a connector, making inheritance possible.
   *
   * @param {AbstractSequelizeConnector} SubClass
   */
  static discriminator(SubClass) {
    const discriminatorKey = this.discriminatorKey;

    assert(!!discriminatorKey, 'Attempt to discriminate class without discriminatorKey');

    const isSubclass = Object.prototype.isPrototypeOf.call(this, SubClass);
    assert(isSubclass, `${SubClass.name} must be a ${this.name} subclass`);

    const discriminatorValue = SubClass[discriminatorKey];

    assert(discriminatorValue !== undefined,
      `${SubClass.name} must have a value for discriminator ${discriminatorKey}`);

    this._discriminatedConnectors = this._discriminatedConnectors || {};
    this._discriminatedConnectors[discriminatorValue] = SubClass;
  }

  /**
   * Instantiates a new instance of either the connector itself or one of his discriminated ones.
   *
   * @param {Object} data
   * @param {boolean} [isNew]
   * @returns {SequelizeConnector}
   */
  static createDiscriminatedInstance(data, isNew) {
    return new (this.getDiscriminatedConnector(data[this.discriminatorKey]))(data, isNew);
  }

  /**
   * Returns the connector associated to `value`. Returns itself if non is found.
   *
   * @param {*} [value]
   * @returns {SequelizeConnector}
   */
  static getDiscriminatedConnector(value) {
    const discriminatorConnectors = this._discriminatedConnectors || {};
    return discriminatorConnectors[value] || this;
  }

  /**
   * Parses arguments passed to find methods.
   *
   * @param {Object} [filters]
   * @param {Object[]|string[]} [scopes]
   * @param {Object} [options]
   * @returns {{filters: Object, scopes: Object[]|string[], options: Object}}
   */
  static parseFindArguments(filters = undefined, scopes = undefined, options = undefined) {
    if (arguments[0] instanceof Array) { // filters skipped, then scopes, options last
      [filters, scopes, options] = [{}, filters, scopes || {}];
    } else if (arguments[1] instanceof Array) { // filters, then scopes, options last
      [filters, scopes, options] = [filters || {}, scopes, options || {}]; // eslint-disable-line no-self-assign
    } else if (arguments.length === 1 && arguments[0] instanceof Object) { // first first, scopes skipped, options last
      [filters, scopes, options] = [filters, scopes, options || {}]; // eslint-disable-line no-self-assign
    } else if (arguments[1] instanceof Object) { // filters first, scopes skipped, options last
      [filters, scopes, options] = [filters || {}, undefined, scopes]; // eslint-disable-line no-self-assign
    } else {
      [filters, scopes, options] = [filters || {}, scopes || undefined, options || {}];
    }
    return { filters, scopes, options };
  }

  /**
   * Returns a new model with applied scopes.
   *
   * @param {Object[], string[]} [scopes]
   * @returns {Sequelize.Model}
   */
  static getScopedModel(scopes = undefined) {
    return (scopes === null || (scopes && scopes.length)) ? this.model.scope(scopes) : this.model;
  }

  /**
   * Creates new entry(ies) in the database.
   *
   * @param {Object|Object[]|AbstractSequelizeConnector|AbstractSequelizeConnector[]} data
   * @param {Object} options
   * @returns {AbstractSequelizeConnector|AbstractSequelizeConnector[]|Object|Object[]}
   */
  static create(data, options = { raw: false }) { // TODO find out how to limit the amount of loops
    const isArray = Array.isArray(data);

    if (!isArray) {
      data = [data];
    }

    data = data.map(item => {
      return item instanceof AbstractSequelizeConnector ? item.toJSON() : item;
    });

    const before = data.map(item => this.createDiscriminatedInstance(item, true));

    return Promise.each(before, item => this._beforeCreate(item, options))
      .then(() => {
        const objects = before.map(item => item.toJSON());
        return Promise.map(objects, item => this.model.create(item).then(created => created.toJSON()));
      }).then(created => {
        const after = created.map(item => this.createDiscriminatedInstance(item, false));
        return Promise.each(after, item => this.afterCreate(item, options)).then(() => {
          const final = options.raw ? created : after;
          return isArray ? final : final[0];
        });
      });
  }

  /**
   * Retrieves entries from the database.
   *
   * @param {Object} [filters]
   * @param {Object[]|string[]} [scopes]
   * @param {Object} [options]
   * @returns {Promise<AbstractSequelizeConnector[]|Object[]>}
   */
  static find(filters, scopes, options) {
    const args = this.parseFindArguments(...arguments);

    if (this.hasDiscriminatorValue) _.set(args, `filters.${this.discriminatorKey}`, this.discriminatorValue);

    return this.getScopedModel(args.scopes)
      .findAll(Object.assign({}, args.options, { where: args.filters, raw: true }))
      .then(objects => {
        if (args.options.raw) return objects;
        return objects.map(object => this.createDiscriminatedInstance(object, false));
      });
  }

  /**
   * Retrieves a single entry from the database;
   *
   * @param {Object} [filters]
   * @param {Object[]|string[]} [scopes]
   * @param {Object} [options]
   * @returns {AbstractSequelizeConnector|Object}
   */
  static findOne(filters, scopes, options) {
    const args = this.parseFindArguments(...arguments);

    if (this.hasDiscriminatorValue) _.set(args, `filters.${this.discriminatorKey}`, this.discriminatorValue);

    return this.getScopedModel(args.scopes)
      .findOne(Object.assign({}, args.options, { where: args.filters, raw: true }))
      .then(object => {
        if (!object) return null;
        if (args.options.raw) return object;
        return this.createDiscriminatedInstance(object, false);
      });
  }

  /**
   * Retrieves a single entry by id from the database;
   *
   * @param {string|number} id
   * @param {Object[]|string[]} [scopes]
   * @param {Object} [options]
   * @returns {AbstractSequelizeConnector|Object}
   */
  static findById(id, scopes, options) {
    const args = this.parseFindArguments({ id }, scopes, options);
    if (this.hasDiscriminatorValue) _.set(args, `filters.${this.discriminatorKey}`, this.discriminatorValue);

    return this.getScopedModel(args.scopes)
      .findOne(Object.assign({}, args.options, { where: args.filters, raw: true }))
      .then(object => {
        if (!object) return null;
        if (args.options.raw) return object;
        return this.createDiscriminatedInstance(object, false);
      });
  }

  /**
   * Removes entries from the database.
   *
   * @param {Object} filters
   * @param {Object} [options]
   * @returns {Promise<number>}
   */
  static remove(filters = {}, options) {
    if (!Object.keys(filters).length) return Promise.reject(new Error(`Attempt to delete full table in ${this.name}`));
    if (this.hasDiscriminatorValue) filters[this.discriminatorKey] = this.discriminatorValue;
    return this.model.destroy(Object.assign({}, options, { where: filters }));
  }

  /**
   * Counts entries in the database.
   *
   * @param {Object} [filters]
   * @param {Object} [options]
   * @returns {number}
   */
  static count(filters = {}, options) {
    if (this.hasDiscriminatorValue) filters[this.discriminatorKey] = this.discriminatorValue;
    return this.model.count(Object.assign({}, options, { where: filters }));
  }

  /**
   * Updates entries in the database.
   *
   * @param {Object} filters
   * @param {Object|AbstractSequelizeConnector} values
   * @param {Object} [options]
   * @returns {Promise<number>}
   */
  static update(filters = {}, values, options) {
    if (!Object.keys(filters).length) {
      throw new Error(`Attempt to update full table in ${this.name}`);
    }

    if (this.hasDiscriminatorValue) {
      filters[this.discriminatorKey] = this.discriminatorValue;
    }

    const previousObject = values instanceof AbstractSequelizeConnector ? values : null;
    if (previousObject) values = previousObject.getModified();

    // Setting properties afterward so that they appear to be modified
    const objectProperties = Object.assign(
      (previousObject && previousObject.toInitialJSON()) || {},
      this.extractValuesFromFilters(filters) || {}
    );
    const object = new this(objectProperties, false).set(values);

    return this._beforeUpdate(object, options).then(() => {
      return this.model.update(object.toJSON(), Object.assign({}, options, { where: filters }))
        .then(result => {
          if (previousObject) previousObject.set(object.getModified(), false);
          return result[0];
        });
    });
  }

  static extractValuesFromFilters(filters) {
    return Object.keys(filters)
      .filter(key => !_.isPlainObject(filters[key]))
      .reduce((acc, key) => {
        acc[key] = filters[key];
        return acc;
      }, {});
  }

  static validate(object) {
    return Promise.resolve();
  }

  static transform(object) {
    return Promise.resolve();
  }

  /**
   * Pre-create hook. Receives the instance and the original options. Async for convenience.
   *
   * @param {AbstractSequelizeConnector} before
   * @param {Object} options
   * @abstract
   */
  static beforeCreate(before, options) {
    return Promise.resolve();
  }

  /**
   * Post-create hook. Receives the instance and the original options. Async for convenience.
   *
   * @param {AbstractSequelizeConnector} after
   * @param {Object} options
   * @abstract
   */
  static afterCreate(after, options) {
    return Promise.resolve();
  }

  static beforeUpdate(object, options) {
    return Promise.resolve();
  }

  static _beforeUpdate(object, options) {
    return this.validate(object).then(() => {
      return this.transform(object).then(() => {
        return this.beforeUpdate(object, options);
      });
    });
  }

  /**
   * Makes required checks before calling beforeCreate.
   *
   * @param {AbstractSequelizeConnector} before
   * @param {Object} options
   * @private
   */
  static _beforeCreate(before, options) {
    return this.validate(before).then(() => {
      return this.transform(before).then(() => {
        return this.beforeCreate(before, options);
      });
    });
  }
}


module.exports = AbstractSequelizeConnector;
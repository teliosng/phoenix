'use strict';

const _ = require('lodash');
const assert = require('assert');

/**
 * SmartEnum
 *
 * Safe enumeration helper. Provides useful methods and prevents accidental access to unexisting keys.
 */
class SmartEnum {

  get values() { return Array.from(this._properties.values()); }
  get keys() { return Array.from(this._properties.keys()); }

  /**
   * @constructor
   * @param {Object} properties
   */
  constructor(properties) {
    assert(_.isPlainObject(properties), '`properties` must be a plain Javascript object');
    this._properties = new Map(_.toPairs(properties));

    // Attach keys
    this._attachProperties();

    // Prevent additional properties from being set
    Object.freeze(this);

    // Prevent consumers from accidentally accessing unexisting keys
    return new Proxy(this, {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else {
          throw new Error(`Attempt to access unexisting key : ${key}`);
        }
      }
    });
  }

  /**
   * Check if enum contains the parameter key.
   *
   * @param {String} key
   */
  hasKey(key) {
    return this._properties.has(key);
  }

  /**
   * Check if enum contains the parameter value.
   *
   * @param {*} value
   */
  has(value) {
    for (const val of this.values) {
      if (val === value) {
        return true;
      }
    }
    return false;
  }

  toJSON() {
    return this.keys.reduce((acc, key) => {
      acc[key] = this[key];
      return acc;
    }, {});
  }

  /**
   * Define read-only properties for each enum key.
   *
   * @private
   */
  _attachProperties() {
    for (const [key, value] of this._properties.entries()) {
      // Create a read only property
      Object.defineProperty(this, key, { value });
    }
  }
}

/**
 * @export
 */
module.exports = SmartEnum;
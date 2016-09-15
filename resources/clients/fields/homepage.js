'use strict';

const Restypie = require('restypie');
const Url = require('url');
const _ = require('lodash');
const URLValidator = require('valid-url');

class HomepageField extends Restypie.Fields.StringField {
  hydrate(value) {
    value = super.hydrate(value);
    const parsed = Url.format(_.pick(Url.parse(value), ['host', 'port', 'pathname', 'protocol']));
    return parsed;
  }
  validate(value) {
    super.validate(value);
    if (!URLValidator.isWebUri(value)) throw new Restypie.TemplateErrors.BadPattern({
      key: this.key,
      expected: 'Valid url'
    });
  }
}

module.exports = HomepageField;
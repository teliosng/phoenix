'use strict';

const SmartEnum = require('../classes/smart-enum');

const MediaTypes = new SmartEnum({
  MOVIE: 'movie',
  TV_SHOW: 'tv_show',
  EPISODE: 'episode',
  TRACK: 'track'
});

module.exports = MediaTypes;
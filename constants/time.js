'use strict';

const SmartEnum = require('../classes/smart-enum');

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const Time = new SmartEnum({
  MILLISECOND,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  WEEK
});

module.exports = Time;
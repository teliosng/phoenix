'use strict';

const cors = require('cors');

module.exports = () => {

  return cors({
    origin: true,
    credentials: true
  });

};
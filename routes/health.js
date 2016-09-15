'use strict';

module.exports = app => {

  app.get('/health', (req, res) => {
    return res.json({ data: { time: new Date() } });
  });

};
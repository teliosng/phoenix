'use strict';

const TRIGGER_NAME = 'unique_bucket_trigger';

module.exports = {
  up(queryInterface, Sequelize, db) {
    return db.query(`
      DROP TRIGGER IF EXISTS ${TRIGGER_NAME};
      CREATE TRIGGER ${TRIGGER_NAME} BEFORE INSERT ON buckets
        FOR EACH ROW BEGIN
          DECLARE vAccountRole VARCHAR(50);
          DECLARE vCount INT;
          SELECT role INTO vAccountRole FROM accounts WHERE id = NEW.accountId;
          IF vAccountRole = 'user' THEN
            SELECT count(*) INTO vCount FROM buckets WHERE accountId = NEW.accountId;
            IF vCount > 0 THEN
              SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'User accounts can only have a single bucket';
            END IF;
          END IF;
        END;
    `);
  },

  down(queryInterface, Sequelize, db) {
    return db.query(`
      DROP TRIGGER IF EXISTS ${TRIGGER_NAME};
    `);
  }
};
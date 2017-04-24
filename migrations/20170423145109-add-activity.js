'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('activity', {
    id: { type: 'int', primaryKey: true },
    user: 'string',
    action: 'string',
    location: 'string',
    datetime: 'string' // ISO8601
  });

};

exports.down = function(db) {
   return db.dropTable('activity');
};

exports._meta = {
  "version": 1
};

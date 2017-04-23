var sqlite = require('sqlite');
var db = new sqlite.Database('brain.db');
db.serialize(function() {
  // db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT" +
  //   ", username STRING, password STRING, role STRING,credit DECIMAL(10,2))");
});
db.close();
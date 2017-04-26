var config = require('../config.js');
var johnny = require('../johnnybot');
var schedule = require('node-schedule');
var sqlite3 = require('sqlite3').verbose();
var SunCalc = require('suncalc');

var run_once = false;
// we want the scheduler bellow to run only once

var j = schedule.scheduleJob('* 17-23 * * *', function() {

	if (run_once === false) {

    	var db = new sqlite3.Database(database.prod.filename);
	    db.serialize(function() {
	        db.all('select is_empty from house;', function(err, rows) {

	            if (rows[0].is_empty === 1) {
	                // There is no one home

	            } else {
	                // There is someone home

	                var url = config.philipsbridge + 'api/' + config.philipsbridge_user + '/lights';
	                client.get(url, function (data, response) {
	                    // parsed response body as js object 
	                    if (data[1].state.on === true ){
	                      // The light is on, do nothing.
	                    }else{
	                      // The light is off, do something
	                      var times = SunCalc.getTimes(new Date(), config.home_town_lat, config.home_town_long);
	                      var today = new Date();
	                      if (today <= times['sunrise'] || today >= times['sunset']) {
	                          johnny.sendMessage(config.telegram_chat_id, 'It\'s so dark! I am going to turn on the lights');
	                          command.lights(true);
	                          run_once = true;
	                      }
	                    }

	            }
	        });
	    });
	    db.close();

	    });
	}
});

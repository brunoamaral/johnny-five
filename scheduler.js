var config = require('./config.js');
var database = require('./database.json');
var command = require('./commands');
var johnny = require('./johnnybot');
var schedule = require('node-schedule');
var sqlite3 = require('sqlite3').verbose();
var SunCalc = require('suncalc');
var Client = require('node-rest-client').Client;
var client = new Client();

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
                    var times = SunCalc.getTimes(new Date(), config.home.latitude, config.home.longitude);
                    var today = new Date();
                    if (today <= times['sunrise'] || today >= times['sunset']) {
                        var url = config.philips.bridge + 'api/' + config.philips.user + '/lights';
                        client.get(url, function(data, response) {
                            if (data[1].state.on === true) {
                                // The light is on, do nothing and cancel following runs
                                run_once = true;
                            } else {
                                // The light is off, do something
                                johnny.sendMessage(config.telegram.chat_id, 'It\'s so dark! I am going to turn on the lights');
                                command.lights(true);
                                run_once = true;
                            }
                        });
                    }
                };
            });
            db.close();

        });
    }
});

var j = schedule.scheduleJob('* 16 59 * *', function() {
    run_once = false;
    });

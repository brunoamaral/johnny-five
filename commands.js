var config = require('./config.js');
var database = require('./database.json');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require("path");
var request = require('request');
var SunCalc = require('suncalc');
var sqlite3 = require('sqlite3').verbose();

var philips_group0 = config.philipsbridge + 'api/' + config.philipsbridge_user + '/groups/0/action';

    function addActivity(user, action, location, time){
        var db = new sqlite3.Database(database.prod.filename);
        console.log(user, action, location, time);
        db.serialize( function(){
            db.run('Insert into activity values(NULL,"' + user + '", "' + action + '","' + location + '","' + time.toString() + '")' );
            });

            db.close(); 
    };

    function kodi(state){
        if(state == 'on' || state == true || state == 'true' ){
            exec('sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
        }else if(state == 'off' || state == false || state == 'false'){
            exec('sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
        }
    }

    function tv(state){
        if(state == 'on' || state == true || state == 'true'){
            exec('/usr/bin/tvservice -p; sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
        }else if(state == 'off' || state == false || state == 'false'){
            exec('/usr/bin/tvservice -o; sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
        }
    }

    function tvStatus(){
        exec('/usr/bin/tvservice -s', function(error, stdout, stderr){
            console.log(stdout);
        });
        return stdout;
    }

    function lights(state){
        if(state == 'on' || state == true || state == 'true'){
            var state = true;
        }else if(state == 'off' || state == false || state == 'false'){
            var state = false;
        }

        var data = {"on":state}
        var headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = request({
            uri: philips_group0,
            json: data,
            method: "PUT",
        }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        console.log(body) 
      }
        });
        return r;
    }

    function alert(state){

        var data = {"on":state, "alert":"select"}
        var headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = request({
            uri: philips_group0,
            json: data,
            method: "PUT",
        }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        console.log(body) 
      }
        });
        return r;
    }

    function isHome(){
        if (fs.existsSync(config.are_you_home_file)) {
            return true;
        }else{
            return false;
        };
    };

    function lastSeen(){
        var last_seen_data = fs.statSync(config.last_seen_file);
        return last_seen_data.mtime;
    }

module.exports = {
    addActivity,
	alert,
	isHome,
	kodi,
	lastSeen,
	lights,
	tv,
	tvStatus,
}
var config = require('./config.js');
var database = require('./database.json');
//var exec = require('ssh-exec');
var exec = require('child_process').exec;

var fs = require('fs');
var path = require("path");
var request = require('request');
var SunCalc = require('suncalc');
var sqlite3 = require('sqlite3').verbose();

var philips_group0 = config.philips.bridge + 'api/' + config.philips.user + '/groups/0/action';

    function addActivity(user, action, location, time){
        var db = new sqlite3.Database(database.prod.filename);
        db.serialize( function(){
            db.run('Insert into activity values(NULL,"' + user + '", "' + action + '","' + location + '","' + time.toString() + '")' );
            });

            db.close(); 
    };

    function houseIsEmpty(is_empty){
        var db = new sqlite3.Database(database.prod.filename);
        db.serialize( function(){
            if (is_empty == true ) {
                is_empty = 1;
            }else if (is_empty == false) {
                is_empty = 0;
            }
            db.run('INSERT OR REPLACE INTO house (id, is_empty) VALUES (1,'+ is_empty +');' );
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





    function buildSite(){ 
        console.log('building site...')
        exec("/usr/bin/ssh -T doc@deLorean -i /home/pi/.ssh/id_rsa ' cd Digital-Insanity; ./build.sh ' ", {uid:1000}, function(error, stdout, stderr) {
            console.log(stdout);
            console.log('stuff happened.')
        });
        console.log('stuff closed')
    }

    function tv(state){
        if(state == 'on' || state == true || state == 'true'){
            exec('/usr/bin/tvservice -p; sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
        }else if(state == 'off' || state == false || state == 'false'){
            exec('/usr/bin/tvservice -o; sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
        }
    }

    function radio(state){
        if(state == 'on' || state == true || state == 'true'){
            exec('/usr/bin/tvservice -p; sudo /usr/sbin/service mopidy start', function(error, stdout, stderr) {});
        }else if(state == 'off' || state == false || state == 'false'){
            exec('/usr/bin/tvservice -o; sudo /usr/sbin/service mopidy stop', function(error, stdout, stderr) {});
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

    function lightsColour(state, xy, hue){
        var url = config.philips.bridge + 'api/' + config.philips.user + '/groups/0/action'

        var data = {"bri": 200, "sat": 254, "hue": hue, "xy":xy}
        var headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = request({
            uri: url,
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
    function wipe(){

        exec('/usr/bin/wipe -fr /media/timemachine/shared/downloads', function(error, stdout, stderr) {});
    }

module.exports = {
    addActivity,
    alert,
    buildSite,
    houseIsEmpty,
    kodi,
    lights,
    lightsColour,
    radio,
    tv,
    tvStatus,
    wipe
}

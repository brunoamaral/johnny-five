var config = require('./config.js');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require("path");
var request = require('request');
var SunCalc = require('suncalc');



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
		var url = config.philipsbridge + 'api/' + config.philipsbridge_user + '/groups/0/action'
		var data = {"on":state}
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
		var url = config.philipsbridge + 'api/' + config.philipsbridge_user + '/groups/0/action'
		var data = {"on":state, "alert":"select"}
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

	function lastSeen(){
		var last_seen_data = fs.statSync(config.last_seen_file);
		return last_seen_data.mtime;
	}
module.exports = {
	alert,
	kodi,
	lastSeen,
	lights,
	tv,
	tvStatus,
}
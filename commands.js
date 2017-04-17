var config = require('./config.js');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require("path");
var request = require('request');
var SunCalc = require('suncalc');



	function kodiOn(){
		exec('sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
	}

	function kodiOff(){
		exec('sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
	}

	function tvOn(){
		exec('/usr/bin/tvservice -p; sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
	}

	function tvOff(){
		exec('/usr/bin/tvservice -o; sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
	}

	function tvStatus(){
		exec('/usr/bin/tvservice -s', function(error, stdout, stderr){
			console.log(stdout);
		});
		return stdout;
	}

	function lights(state){
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
module.exports = {
	kodiOn,
	kodiOff,
	tvOn,
	tvOff,
	tvStatus,
	lights,
	alert,
}
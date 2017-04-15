// Requirements
var config = require('../config.js');
var exec = require('child_process').exec;
var request = require('request');
var SunCalc = require('suncalc');
var fs = require('fs');

// List of End points

// /

// /ping
// Your usual vanilla ping, nothing more than pong

// /ping/auth/<key>
// Same as above but requires authentication

// /tv/on/<key>
// Turns the TV on, duh

// /tv/off/<key>
// Same as above, but different

// /arriving/<key>
// Triggers a sequence of events when you ARRIVE at the geofence.
// If the current time is after sunset and before sunrise, it triggers the lights(True) command to turn on the lights when you get home.

// /leaving/<key>
// Triggers a sequence of events when you LEAVE the geofence

// /lights/<state>/<key>
// Turns the lights on or off. State accepts paramenter "on" or "off"

// /sunset/<key>
// Triggers a sequence of events when the sun sets

// /sunrise/<key>
// Triggers a sequence of events when the sun sets
var express = require('express');
var router = express.Router();
var path = require("path");
var fs = require('fs');

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

/* GET home page. */
router.get('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Hello World' }));
});

router.get('/ping', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Pong' }));
});

router.get('/ping/auth/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Auth Pong' }));
});

// /kodi/on/<key>
router.get('/kodi/on/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv ON' }));
	kodiOn();
});

// /kodi/off/<key>
router.get('/kodi/off/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv ON' }));
	kodiOff();
});
// /tv/on/<key>
router.get('/tv/on/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv ON' }));
	tvOn();
});

// /tv/off/<key>
router.get('/tv/off/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv OFF' }));
	tvOff();
});

// /tv/status/<key>
router.get('/tv/status/' + config.hashkey, function(req, res, next){
	 
	res.setHeader('Content-Type', 'application/json');
	tvStatus(res.send(JSON.stringify({ response: tv_status })));
	
});

// /arriving/<key>
router.get('/arriving/' + config.hashkey, function(req, res,next){

		var home_command = '/usr/bin/touch ' + config.are_you_home_file;
		var last_seen_command = '/usr/bin/touch ' + config.last_seen_file;
		var today = new Date();
		var times = SunCalc.getTimes(new Date(), config.home_town_lat, config.home_town_long);

		exec(home_command, function(error, stdout, stderr) {});
		exec(last_seen_command, function(error, stdout, stderr) {});
		tvOn()

		if(today <= times['sunrise'] || today >= times['sunset'] ){
			lights(true)
		}

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Welcome home!' }));

})

// /leaving/<key>

router.get('/leaving/' + config.hashkey, function(req, res,next){

	var command = '/bin/rm ' + config.are_you_home_file
	exec(command, function(error, stdout, stderr) {});
	tvOff()
	lights(false);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Godspeed!' }));
});


// /lights/<state>/<key>

router.get('/lights/:state/' + config.hashkey, function(req, res,next){

	if(req.params.state == 'on'){
		var state = true;
	}else if(req.params.state == 'off'){
		var state = false;
		console.log(state);
	}
	
	lights(state);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Go go gadget lights!' }));
	// 	if state == 'on':
	// 		state = True
	// 	elif state == 'off':
	// 		state = false
	// 	else:
	// 		return jsonify({ 'return': 'Error'})

	// 	return jsonify({'return': lights(state).content})
	// else:
	// 	return jsonify({'return': authfailed})		

});

router.get('/alert/' + config.hashkey, function(req, res,next){

	var state = true;

	alert(state);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Go go gadget lights!' }));

});

// /sunset/<key>
router.get('/sunset/' + config.hashkey, function(req, res,next){

	try {
		fs.accessSync(config.are_you_home_file, fs.F_OK);
		// Do something
		lights(true);
	} catch (e) {
		// It isn't accessible
	}


// 	if key == hashkey and os.path.isfile(are_you_home_file):  
// 		state = True
// 		return jsonify({'return': lights(state).content})
// 	else:
// return jsonify({'return': authfailed}) 


});

// /sunrise/<key>

router.get('/sunrise/' + config.hashkey, function(req, res,next){
	try {
		fs.accessSync(config.are_you_home_file, fs.F_OK);
		// Do something
	} catch (e) {
		// It isn't accessible
		lights(false);
	}

// 	if key == hashkey and os.path.isfile(are_you_home_file):  
// 		state = false
// 		return jsonify({'return': lights(state).content})
// 	else:
// return jsonify({'return': authfailed}) 


});

router.get('/alloff/' + config.hashkey, function(req, res,next){
		tvOff();
		lights(false);
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Good night!' }));
});

// serve static html
// router.get('/home', function(req, res) {
//     res.sendFile('index.html', { root: path.join(__dirname, '../public') });
// });

module.exports = router;

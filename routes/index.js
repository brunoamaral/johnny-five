// Requirements
var command = require('../commands');
var config = require('../config.js');
var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var johnny = require('../johnnybot');
var path = require("path");
var request = require('request');
var router = express.Router();
var SunCalc = require('suncalc');
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
	res.send(JSON.stringify({ response: 'Turning kodi ON' }));
	command.kodiOn();
});

// /kodi/off/<key>
router.get('/kodi/off/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning kodi OFF' }));
	command.kodiOff();
});

// /tv/on/<key>
router.get('/tv/:state/' + config.hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv ' + req.params.state + '!' }));
	command.tv(req.params.state);
});

// /tv/status/<key>
router.get('/tv/status/' + config.hashkey, function(req, res, next){
	 
	res.setHeader('Content-Type', 'application/json');
	command.tvStatus(res.send(JSON.stringify({ response: tv_status })));
	
});

// /arriving/<key>
router.get('/arriving/' + config.hashkey, function(req, res,next){
	try {
		var home_command = '/usr/bin/touch ' + config.are_you_home_file;
		var times = SunCalc.getTimes(new Date(), config.home_town_lat, config.home_town_long);

		exec(home_command, function(error, stdout, stderr) {});

		var today = new Date();
		command.addActivity('Bruno', 'arriving', 'home', today);

		command.tv(true);
		console.log(times);
		if(today <= times['sunrise'] || today >= times['sunset'] ){
			johnny.sendMessage(config.telegram_chat_id, 'It\'s so dark! I am going to turn on the lights');
			command.lights(true);
		}

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Welcome home!' }));
	} catch (e) {
		console.log('oh no')
		console.log(e)
	}
});

// /leaving/<key>

router.get('/leaving/' + config.hashkey, function(req, res,next){

	var not_home_command = '/bin/rm ' + config.are_you_home_file
	exec(not_home_command, function(error, stdout, stderr) {});
	command.tv(false)
	command.lights(false);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Godspeed!' }));
	johnny.sendMessage(config.telegram_chat_id, 'leaving' );

	var today = new Date();
	command.addActivity('Bruno', 'leaving', 'home', today);

});


// /lights/<state>/<key>

router.get('/lights/:state/' + config.hashkey, function(req, res,next){

	command.lights(req.params.state);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Go go gadget lights!' }));

});

router.get('/alert/' + config.hashkey, function(req, res,next){

	var state = true;

	command.alert(state);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Go go gadget lights!' }));

});

// /sunset/<key>
router.get('/sunset/' + config.hashkey, function(req, res,next){

	try {
		fs.accessSync(config.are_you_home_file, fs.F_OK);
		// Do something
		command.lights(true);
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
		command.lights(false);
	}

// 	if key == hashkey and os.path.isfile(are_you_home_file):  
// 		state = false
// 		return jsonify({'return': lights(state).content})
// 	else:
// return jsonify({'return': authfailed}) 


});

router.get('/alloff/' + config.hashkey, function(req, res,next){
		command.tv(false);
		command.lights(false);
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Good night!' }));
});

// serve static html
// router.get('/home', function(req, res) {
//     res.sendFile('index.html', { root: path.join(__dirname, '../public') });
// });

// Sense and respond ! 
router.put('/telegram/' + config.hashkey, function(req, res,next){
  try {
    var value = req.body.arg;
    johnny.sendMessage(config.telegram_chat_id, value );
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ response: value }));

    // Do something
  } catch (e) {
    // It isn't accessible

  }
});

router.put('/activity/' + config.hashkey, function(req, res,next){
  try {
    var user = req.body.user;
    var action = req.body.action;
    var location = req.body.location;
    var time = new Date();

    var resp = 'I last saw ' + user + ' ' + action + ' at ' + location + ' on ' + time;
		
	command.addActivity(user, action, location, time);

    johnny.sendMessage(config.telegram_chat_id, resp );
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ response: resp }));

    // Do something
  } catch (e) {
    // It isn't accessible

  }
});


module.exports = router;

// Requirements
var command = require('../commands');
var config = require('../config.js');
var Client = require('node-rest-client').Client;
var client = new Client();
var database = require('../database.json');
var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var johnny = require('../johnnybot');
var path = require("path");
var request = require('request');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var SunCalc = require('suncalc');
var cors = require('cors');

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
		command.houseIsEmpty(false);
		var times = SunCalc.getTimes(new Date(), config.home.latitude, config.home.longitude);

		var today = new Date();
		command.addActivity('Bruno', 'arriving', 'Home', today);

		command.tv(true);
		console.log(times);
		if(today <= times['sunrise'] || today >= times['sunset'] ){
			johnny.sendMessage(config.telegram.chat_id, 'It\'s so dark! I am going to turn on the lights');
			command.lights(true);
		}

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Welcome home!' }));
	} catch (e) {
		console.log(e)
	}
});

// /leaving/<key>

router.get('/leaving/' + config.hashkey, function(req, res,next){
	var today = new Date();
	command.addActivity('Bruno', 'leaving', 'Home', today);
	command.houseIsEmpty(true);
	command.tv(false)
	command.lights(false);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Godspeed!' }));
});


// /lights/<state>/<key>

router.get('/lights/:state/' + config.hashkey, function(req, res,next){

	command.lights(req.params.state);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Go go gadget lights!' }));

});
router.get('/telegram/message/:msg/' + config.hashkey, function(req, res, next){
	          try {
			              var value = req.params.msg;
			              johnny.sendMessage(config.telegram.chat_id, value );
			                  res.setHeader('Content-Type', 'application/json');
			              res.send(JSON.stringify({ response: value }));
			            } catch (e) {
			}
});
router.get('/lightsColour/:state/:colour/' + config.hashkey, function(req, res,next){
	if (req.params.colour == "test"){var xy = []; var hue = 46920; }
	if (req.params.colour == "red"){var xy = [0.6679,0.3181]; var hue = 65280; }
	if (req.params.colour == "yellow"){var xy = [0.5425,0.4196]; var hue = 12750;}
	if (req.params.colour == "green"){var xy = [0.41,0.51721]; var hue = 25500;}
	if (req.params.colour == "blue"){var xy = [0.1691,0.0441]; var hue = 46920;}
	if (req.params.colour == "pink"){var xy = [0.4149,0.1776]; var hue = 56100;}
	
	if (req.params.state == 'on'){
		var state = true;
	}else if(req.params.state == 'off'){
		var state = false;
	}
	command.lights(req.params.state);
	command.lightsColour(state, xy, hue);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ "Johnny Five": 'Hello Soumaya. I have turned the lights ' + req.params.colour + '.' }));

});

router.get('/alert/' + config.hashkey, function(req, res,next){

	var state = true;
	command.alert(state);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Go go gadget lights!' }));

});

// /sunset/<key>
router.get('/sunset/' + config.hashkey, function(req, res,next){

		var db = new sqlite3.Database(database.prod.filename);
		var is_empty = null;
		db.serialize( function(){
		   db.all('SELECT is_empty FROM house;', function(err,rows){
		    
		    if ( rows[0].is_empty === 0 ){ command.lights(true);}
		   } );
		   db.close();
		});
 
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Sun in the sky, you know how I feel ...' }));


});

// /sunrise/<key>

router.get('/sunrise/' + config.hashkey, function(req, res,next){

		var db = new sqlite3.Database(database.prod.filename);
		var is_empty = null;
		db.serialize(function() {
		    db.all('SELECT is_empty FROM house;', function(err, rows) {

		        if (rows[0].is_empty === 0) {
		            //'There is someone home ';
		        
		            var url = config.philips.bridge + 'api/' + config.philips.user + '/lights';

		            client.get(url, function(data, response) {
		                // parsed response body as js object 
		                if (data[1].state.on === true) {
		                    command.lights(false);
		                } else {

		                }

		            });
		        }
		    });
		    db.close(); 
		});
} );

router.get('/alloff/' + config.hashkey, function(req, res,next){
		command.tv(false);
		command.lights(false);
		command.radio(false);
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Good night!' }));
});

function getAndSendMessage(req, res, next){
	  try {
	    var value = req.body.arg;
	    johnny.sendMessage(config.telegram.chat_id, value );
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ response: value }));
	  } catch (e) {

	  }
}

// Sense and respond ! 
router.put('/telegram/' + config.hashkey, function(req, res,next){
	getAndSendMessage(req, res, next);
});
router.post('/telegram/' + config.hashkey, function(req, res,next){
	    response.header("Access-Control-Allow-Origin", "*");
	    response.header("Access-Control-Allow-Headers", "X-Requested-With");
	    response.header("Access-Control-Allow-Methods', 'GET,POST");
	getAndSendMessage(req, res, next);
});
router.put('/activity/' + config.hashkey, function(req, res,next){
  try {
    var user = req.body.user;
    var action = req.body.action;
    var location = req.body.location;
    var time = new Date();

    var resp = 'I last saw ' + user + ' ' + action + ' at ' + location + ' on ' + time;
		
	command.addActivity(user, action, location, time);

    johnny.sendMessage(config.telegram.chat_id, resp );
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ response: resp }));

    // Do something
  } catch (e) {
    // It isn't accessible

  }
});


module.exports = router;

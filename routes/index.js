// Requirements
var exec = require('child_process').exec;

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


//
// global config file for johnny-five
//

//
// Philips hue related stuff
var philipsbridge = 'http://192.168.1.172/';
var philipsbridge_user = 'johnnyfive';

//
// set your home town for sunrise/sunset calculation
var home_town = 'Lisbon';

//
// set your hashkey here, used for kind of a weak auth
var hashkey = '77c4c6b0a85aa28e3a32042f86ff54d0';

var authfailed = 'Authentication failed';

var are_you_home_file = '/var/web/johnny-five/tmp/home';
var last_seen_file = '/var/web/johnny-five/tmp/last_seen';


var express = require('express');
var router = express.Router();
var path = require("path");
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Hello World' }));
});

router.get('/ping', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Pong' }));
});

router.get('/ping/auth/' + hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Auth Pong' }));
});

// /tv/on/<key>
router.get('/tv/on/' + hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv ON' }));

	exec('sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
	exec('/usr/bin/tvservice -p', function(error, stdout, stderr) {});

});

// /tv/off/<key>
router.get('/tv/off/' + hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv OFF' }));

	exec('sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
	exec('/usr/bin/tvservice -o', function(error, stdout, stderr) {});

});

// serve static html
// router.get('/home', function(req, res) {
//     res.sendFile('index.html', { root: path.join(__dirname, '../public') });
// });

module.exports = router;

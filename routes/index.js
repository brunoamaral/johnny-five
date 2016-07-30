// Requirements
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
var home_town_lat = '38.7223';
var home_town_long = '9.1393';

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

function tvOn(){
	exec('sudo /usr/sbin/service kodi start', function(error, stdout, stderr) {});
	exec('/usr/bin/tvservice -p', function(error, stdout, stderr) {});
}

function tvOff(){
	exec('sudo /usr/sbin/service kodi stop', function(error, stdout, stderr) {});
	exec('/usr/bin/tvservice -o', function(error, stdout, stderr) {});
}

function lights(state){
	url = philipsbridge + 'api/' + philipsbridge_user + '/groups/0/action'
	data = {"on":state}
	headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
	r = request.put(url, data=json.dumps(data), headers=headers);
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

router.get('/ping/auth/' + hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Auth Pong' }));
});

// /tv/on/<key>
router.get('/tv/on/' + hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv ON' }));
	tvOn();
});

// /tv/off/<key>
router.get('/tv/off/' + hashkey, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ response: 'Turning the tv OFF' }));
	tvOff();
});

// /arriving/<key>
router.get('/arriving/' + hashkey, function(req, res,next){

		var home_command = '/usr/bin/touch ' + are_you_home_file;
		var last_seen_command = '/usr/bin/touch ' + last_seen_file;
		exec(home_command, function(error, stdout, stderr) {});
		exec(last_seen_command, function(error, stdout, stderr) {});
		tvOn()

		var today = new Date();
		var tomorrow = today.getDate() + 1;

		var times = SunCalc.getTimes(new Date(), home_town_lat, home_town_long);

		if(today <= times.sunrise() || today >= times.sunset()){
			lights(true)
		}

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ response: 'Welcome home!' }));

})

// /leaving/<key>

router.get('/leaving/' + hashkey, function(req, res,next){

	var command = '/bin/rm ' + are_you_home_file
	exec(command, shell=True)
	tv_off_command()
	lights(false);
});


// /lights/<state>/<key>

router.get('/lights/:state' + '/' + hashkey, function(req, res,next){

	if(state == 'on'){
		var state = true;
	}else if(state == 'off'){
		var state = false;
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

// /sunset/<key>
router.get('/sunset/' + hashkey, function(req, res,next){

	try {
		fs.accessSync(are_you_home_file, fs.F_OK);
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

router.get('/sunrise/' + hashkey, function(req, res,next){
	try {
		fs.accessSync(are_you_home_file, fs.F_OK);
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

router.get('/alloff/' + hashkey, function(req, res,next){
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

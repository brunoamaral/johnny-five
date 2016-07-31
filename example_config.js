module.exports = {
	//
	// global config file for johnny-five
	//

	//
	// Philips hue related stuff
	philipsbridge: 'http://xxx.xxx.xxx.xxx/',
	philipsbridge_user: 'USER',

	//
	// set your home town for sunrise/sunset calculation
	home_town: 'Lisbon',
	home_town_lat: '38.7223',
	home_town_long: '9.1393',

	//
	// set your hashkey here, used for kind of a weak auth
	hashkey: 'SET YOUR HASHKEY HERE',

	authfailed: 'Authentication failed',

	are_you_home_file: '/var/web/johnny-five/tmp/home', // EXAMPLE
	last_seen_file: '/var/web/johnny-five/tmp/last_seen', //EXAMPLE
};
module.exports = {
	//
	// global config file for johnny-five
	//
	//
	// set your hashkey here, used for kind of a weak auth
	hashkey: 'SET YOUR HASHKEY HERE',

	authfailed: 'Authentication failed',

	//
	// Philips hue related stuff
	philips:{
		bridge: 'http://xxx.xxx.xxx.xxx/',
		user: 'USER',		
	}

	//
	// Location 
	// set your home town for sunrise/sunset calculation
	home: {
		town: 'Lisbon',
		latitude: '38.7223',
		longitude: '9.1393',
		location: '38.7405994,-9.130999699999961',	
	}

	//
	// telegram configuration
	telegram: {
		token: 'TELEGRAM BOT TOKEN',
		user: 'USER NAME',
		chat_id: '',
	}

	//
	// Mail Gun
	mailgun: {
		IPAddress: 'XXX',
		SMTPHostname: 'XXX',
		DefaultSMTPLogin: 'postmaster@email.comXXX',
		DefaultPassword: 'XXX',
		APIBaseURL:	'XXXX',
		APIKey:	'XXX'		
	}


};
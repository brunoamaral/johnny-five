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
		philipsbridge: 'http://xxx.xxx.xxx.xxx/',
		philipsbridge_user: 'USER',		
	}

	//
	// Location 
	// set your home town for sunrise/sunset calculation
	home: {
		home_town: 'Lisbon',
		home_town_lat: '38.7223',
		home_town_long: '9.1393',
		location: '38.7405994,-9.130999699999961',	
	}

	//
	// telegram configuration
	telegram: {
		token: 'TELEGRAM BOT TOKEN',
		telegramUser: 'USER NAME',
		telegram_chat_id: '',
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
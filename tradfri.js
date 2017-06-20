var config = require('./config.js');
var database = require('./database.json');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var coap        = require('coap')


var ikeaLights = {
	host: config.tradfri.ip,
	pathname: '',
	port: 5684,
	options: {
		user: 'Client_identity',
		key: config.tradfri.securityCode,
	},
}


    function tradfri(state){
        if(state == 'on' || state == true || state == 'true' ){
		ikeaLights.pathname = '15001/65538',
		ikeaLights.options = {
			5850:'1'}

		coap.request(ikeaLights);
        }else if(state == 'off' || state == false || state == 'false'){
        
        }
    }




module.exports = {
   tradfri 
}

var config = require('./config.js');
var database = require('./database.json');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var coap = require('coap')
const b = require('buffer').Buffer;

var ikeaLights = {
    host: config.tradfri.ip,
    pathname: '',
    port: 5684,
    options: {
        user: b.from('Client_identity'),
        key: b.from(config.tradfri.securityCode),
    },
}

function tradfri(state) {
    if (state == 'on' || state == true || state == 'true') {
        ikeaLights.pathname = '/15001/65538'
        ikeaLights.method = 'GET'

        var req = coap.request(ikeaLights);
        console.log(req)
        req.on('response', function(res) {
            console.log(res);
            res.pipe(process.stdout)
            res.on('end', function() {
                console.log("ending")
                // process.exit(0)
            })
            res.end();
        })

        var payload = {
            3311: [{
                5850: 1,
            }]
        }
        // req.write(b.from(JSON.stringify(payload)));

    } else if (state == 'off' || state == false || state == 'false') {

    }
}




module.exports = {
    tradfri
}
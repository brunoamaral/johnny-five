#!/var/www/johnny-five/bin/python

# List of End points

# /
#
# /ping
# Your usual vanilla ping, nothing more than pong
#
# /ping/auth/<key>
# Same as above but requires authentication
#
# /tv/on/<key>
# Turns the TV on, duh
#
# /tv/off/<key>
# Same as above, but different
#
# /arriving/<key>
# Triggers a sequence of events when you ARRIVE at the geofence.
# If the current time is after sunset and before sunrise, it triggers the lights(True) command to turn on the lights when you get home.
#
# /leaving/<key>
# Triggers a sequence of events when you LEAVE the geofence
#
# /lights/<state>/<key>
# Turns the lights on or off. State accepts paramenter "on" or "off"
#
# /sunset/<key>
# Triggers a sequence of events when the sun sets
#
# /sunrise/<key>
# Triggers a sequence of events when the sun sets


import time
import subprocess
import os.path
import json
import requests
from datetime import datetime, time, timedelta
from astral import Astral
import pytz
from flask import Flask, jsonify

# import global variables
from config import *

authfailed = 'Authentication failed'

are_you_home_file = '/var/web/johnny-five/tmp/home'
last_seen_file = '/var/web/johnny-five/tmp/last_seen'
app = Flask(__name__)

# Setting up the linux commands we need to use
#
# List:
# - tvservice
# - service kodi start/stop
#
def tv_on_command():
	subprocess.call('/usr/bin/tvservice -p', shell=True)
	subprocess.call('sudo /usr/sbin/service kodi start', shell=True)

def tv_off_command():
	subprocess.call('sudo /usr/sbin/service kodi stop', shell=True)
	subprocess.call('/usr/bin/tvservice -o', shell=True)

def lights(state=None):
	url = philipsbridge + 'api/' + philipsbridge_user + '/groups/0/action'
	data = {"on":state}
	headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
	r = requests.put(url, data=json.dumps(data), headers=headers)
	return r

# Configure the routes
#
# Current API list:
# - Tv On and Tv Off
# - ping with and without the hashkey
# - Arriving and Leaving (used for IFTTT geofence)
# - error handler for 404
# 
@app.route("/")
def hello():
	return jsonify({'return': 'Hello World!'})

@app.route("/ping")
def ping():
	return jsonify({'return': 'Pong!'})

@app.route('/ping/auth/<key>', methods=['GET'])
def auth_ping(key=None):
	if key == hashkey:
		return jsonify({'return': 'Authenticated Pong!'})
	else:
		return jsonify({'return': authfailed})

#
# What's on TV ?
#

@app.route("/tv/on/<key>", methods=['GET'])
def tv_on(key=None):
	if key == hashkey:
		tv_on_command()
		return jsonify({'return': 'Turning tv ON!'})
	else:
		return jsonify({'return': authfailed})

@app.route("/tv/off/<key>", methods=['GET'])
def tv_off(key=None):
	if key == hashkey:
		tv_off_command()
		return jsonify({'return': 'Turning tv OFF!'})
	else:
		return jsonify({'return': authfailed})

#
# Are you home?
#

@app.route('/arriving/<key>', methods=['GET'])
def arriving(key=None):
	if key == hashkey:

		home_command = '/usr/bin/touch ' + are_you_home_file
		last_seen_command = '/usr/bin/touch ' + last_seen_file
		subprocess.call(home_command, shell=True)
		subprocess.call(last_seen_command, shell=True)
		tv_on_command()

		today = pytz.UTC.localize(datetime.now())
		tomorrow = today + timedelta(days=1)

		a = Astral()

		sunset = a[home_town].sun(date=today, local=True)['sunset']
		sunrise = a[home_town].sun(date=today, local=True)['sunrise']

		if today <= sunrise or today >= sunset:
			lights(True)
		else:
			print today 
			print tomorrow 
			print sunrise 
			print sunset 

		return jsonify({'return': 'Welcome!'})
	else:
		return jsonify({'return': authfailed})

@app.route('/leaving/<key>', methods=['GET'])
def leaving(key=None):
	if key == hashkey:

		command = '/bin/rm ' + are_you_home_file

		subprocess.call(command, shell=True)
		tv_off_command()
		lights(False)
		return jsonify({'return': 'Goodbye!'})
	else:
		return jsonify({'return': authfailed})

#
# Let's turn on the lights !
#

@app.route('/lights/<state>/<key>', methods=['GET'])
def api_lights(state=None, key=None):

	if key == hashkey: 
		if state == 'on':
			state = True
		elif state == 'off':
			state = False
		else:
			return jsonify({ 'return': 'Error'})

		return jsonify({'return': lights(state).content})
	else:
		return jsonify({'return': authfailed})		


#
# Everyday at sunset, turn on lights if I am home
#


@app.route('/sunset/<key>', methods=['GET'])
def api_sunset(key=None):

	if key == hashkey and os.path.isfile(are_you_home_file):  
		state = True
		return jsonify({'return': lights(state).content})
	else:
		return jsonify({'return': authfailed})		


#
# Everyday at sunrise, turn off lights if I am home
#

@app.route('/sunrise/<key>', methods=['GET'])
def api_sunrise(key=None):

	if key == hashkey and os.path.isfile(are_you_home_file):  
		state = False
		return jsonify({'return': lights(state).content})
	else:
		return jsonify({'return': authfailed})		

#
# Turn all off
#

@app.route('/alloff/<key>', methods=['GET'])
def alloff(key=None):
	if key == hashkey:

#		subprocess.call(command, shell=True)
		tv_off_command()
		lights(False)
		return jsonify({'return': 'Good night!'})
	else:
		return jsonify({'return': authfailed})

#  Error. Grasshopper disassembled... Re-assemble! 
@app.errorhandler(404)
def not_found(error):
	return jsonify({ 'return': 'Not found'})

# @app.errorhandler(500)
# def not_found(error):
# 	return make_response('Malfunction. Need input.', 500)
# @app.errorhandler(502)
# def not_found(error):
# 	return make_response('Malfunction. Need input.', 502)

if __name__ == "__main__":
	app.run(host='0.0.0.0', debug = True)


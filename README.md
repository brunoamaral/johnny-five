# johnny-five

Johnny Five is an API for your raspberrypi to interface with the Maker channel from IFTTT. 

The features so far are simple. He turns on a monitor, fires up kodi, turns on Philips Hue lights and reacts when I arrive or leave home.

At sunset and sunrise, Johnny turns the lights on or off.

It's not much, yet he is a good example on how a very simple script can improve your daily routines.

If you have any questions or suggestions, please get in touch.

**Not to be confused** with http://johnny-five.io/ the JavaScript robotics and IoT programming framework, developed at Bocoup, based on Arduino Firmata Protocol that can be found here: https://github.com/rwaldron/johnny-five


# Ikea Tradfri

<https://learn.pimoroni.com/tutorial/sandyj/controlling-ikea-tradfri-lights-from-your-pi>

# Bulb list

First bulb : 65537
Second bulb : 65538
Third bulb : 65539
Fourth ...

# ON and OFF
coap-client -m put -u "Client_identity" -k "Secret Key on the bottom of the gateway" -e '{ "3311": [{ "5850": 0 }] }' "coaps://IP-OF_GATEWAY:5684/15001/65538"

# Query single bulb

coap-client -m get -u  "Client_identity"  -k  "Secret Key"  coaps://IP-OF_GATEWAY:5684/15001/65538"



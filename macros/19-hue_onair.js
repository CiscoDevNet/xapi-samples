//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

/*
 * Turns red a designated Hue bulb when a call is in progress, 
 * and keep green when out of call.
 * 
 * pre-req:
 *   - configure the macro with your Hue Bridge info and you're good to go.
 *   - configure your device for HttpClient
 *
 */

 const xapi = require('xapi');

//
// Hue Library
//

// ACTION: Update for your Philips Hue deployment
const HUE_BRIDGE = '192.168.1.33';
const HUE_USERNAME = 'EM2Vg2GtNUqAASukv47wm1pWY0FayFe48D03f6Cb';
const HUE_LIGHT = 1; // number of the light in your deployment

console.info(`Hue Bridge with ip: ${HUE_BRIDGE}, bulb: ${HUE_LIGHT}`);
const hue_url = `http://${HUE_BRIDGE}/api/${HUE_USERNAME}/lights/${HUE_LIGHT}/state`;

const COLOR_RED = { on: true, hue: 65535, sat: 255};
const COLOR_BLUE = { on: true, hue: 46920, sat: 255};
const COLOR_GREEN = { on: true, hue: 25500, sat: 255};
const COLOR_WHITE = { on: true, hue: 0, sat: 0};
const COLOR_BLACK = { on: false};
function changeColor(color) {
   
   // Post message
   xapi.command('HttpClient Put', {
         Header: ["Content-Type: application/json"],
         Url: hue_url,
         AllowInsecureHTTPS: "True"
      },
      JSON.stringify(color))
      .catch((err) => {
         console.error('could not contact the Hue Bridge');
      });
}

//
// Macro
//

xapi.on('ready', init);

function init() {
   // Green at launch
   changeColor(COLOR_GREEN);
         
   // Listen to active calls and update color accordingly
   xapi.status.on("SystemUnit State NumberOfActiveCalls", (activeCalls) => {
      console.debug(`NumberOfActiveCalls is: ${activeCalls}`)
      
      // Turn red if call in progress
      if (activeCalls > 0) {
         console.info('call in progress');
         changeColor(COLOR_RED);
         return;
      }
      
      // Turn green if out of call
      console.log('no active call');
      changeColor(COLOR_GREEN);
   });
   
   
}
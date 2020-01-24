//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

/*
 * This macro will enlighten your meeting room,
 * no complementary In-Room control needed:
 * 
 * pre-req:
 *   - configure the macro with your Hue Bridge info and you're good to go.
 *   - configure your device for HttpClient
 * 
 */

const xapi = require('xapi');

xapi.on('ready', () => {
   disco1(1000, false);
   //disco2(0, 1000, false);
});

// Blinks at a regular delay, with changing color
// example: disco1(1000, false);

function disco1(delay, black) {
   let color = COLOR_BLACK;
   if (!black) {
      color = {
         hue: Math.round(Math.random() * 65535),
         on: true,
         sat: 255
      };
   }

   // comment this line to remove blinking effect
   black = !black;
   changeColor(color);

   const MIN_DELAY = 300;
   setTimeout(function () {
      disco1(delay + MIN_DELAY, black);
   }, delay);
}

// Blinks at random delays and random colors
// example: disco2(300, 1000, false);
function disco2(delay, maxDelay, black) {
   // Randomize color
   let color = COLOR_BLACK;
   if (delay < 500 || !black) {
      color = {
         hue: Math.round(Math.random() * 65535),
         on: true,
         sat: 255
      };
   }

   // comment this line to remove blinking effect
   black = !black;
   changeColor(color);

   // Randomize delay
   const MIN_DELAY = 300;
   let nextDelay = Math.round(Math.random() * maxDelay) + MIN_DELAY;
   setTimeout(function () {
      disco2(nextDelay, maxDelay + MIN_DELAY, black);
   }, delay);
}


//
// Hue Library
//

// ACTION: Configure for your Philips Hue deployment
const HUE_BRIDGE = '192.168.1.33';
const HUE_USERNAME = 'EM2Vg2GtNUqAASukv47wm1pWY0FayFe48D03f6Cb';
const HUE_LIGHT = 1; // number of the light in your deployment

console.info(`Hue Bridge with ip: ${HUE_BRIDGE}, bulb: ${HUE_LIGHT}`);
const hue_url = `http://${HUE_BRIDGE}/api/${HUE_USERNAME}/lights/${HUE_LIGHT}/state`;

const COLOR_RED = { on: true, hue: 65535, sat: 255 };
const COLOR_BLUE = { on: true, hue: 46920, sat: 255 };
const COLOR_GREEN = { on: true, hue: 25500, sat: 255 };
const COLOR_WHITE = { on: true, hue: 0, sat: 0 };
const COLOR_BLACK = { on: false };

function changeColor(color) {

   console.debug(`posting to hue bulb: ${JSON.stringify(color)}`)

   // Post message
   xapi.command(
      'HttpClient Put',
      {
         Header: ["Content-Type: application/json"],
         Url: hue_url,
         AllowInsecureHTTPS: "True"
      },
      JSON.stringify(color))
      .catch((err) => {
         console.error('could not contact the Hue Bridge');
      });
}

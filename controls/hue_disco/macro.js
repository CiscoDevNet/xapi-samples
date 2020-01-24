const xapi = require('xapi');

xapi.on('ready', init);

function init() {
   let slider = 0;
   xapi.event.on('UserInterface Extensions Widget Action', (event) => {
      if ((event.WidgetId == 'DISCO_slider') && (event.Type == 'released')) {
         console.debug(`updated slider to: ${event.Value}`);
         slider = event.Value;
      }
   });
   xapi.command('UserInterface Extensions Widget SetValue', {
      WidgetId: 'DISCO_slider',
      Value: 0
   })
      .catch((err) => {
         if (err.message == 'Unknown widget: \'DISCO_slider\'') {
            console.warn('is the Disco Control Panel deployed? no worries I can live with it...');
         }
      })

   const MIN_DELAY = 300;
   function latestDelay(max) {
      let delay = Math.round((255 - slider) / 255 * max) + MIN_DELAY;
      console.debug(`new delay: ${delay}`)
      return delay;
   }

   disco(latestDelay, 2200, false);
}


// Blinks with random colors with a delay that can be dynamically changed
// example: disco(latestDelay, 3000, false);

function disco(getDelay, maxDelay, black) {
   // Get current value for delay
   let delay = getDelay(maxDelay);

   // Randomize color
   let color = COLOR_BLACK;
   if (delay < 800 || !black) {
      color = {
         hue: Math.round(Math.random() * 65535),
         on: true,
         sat: 255
      };

   }
   black = !black;
   changeColor(color);

   // Randomize delay
   setTimeout(function () {
      disco(getDelay, maxDelay, black);
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
const hue_url = `http://${HUE_BRIDGE}/api/${HUE_USERNAME}/lights/${HUE_LIGHT}/state`

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

//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Implements Environment Variables for Macro:
 *    A. ENV.js     : this macro manages ENV variables (stores, returns values)
 *    B* getenv.js  : this is not a macro but a code snippet that you insert into existing macros to retrieve ENV variables (local to your device)
 * 
 * Quick start:
 *    - customize the list of ENV variables for your device
 *    - deploy the macro to your device
 *    - insert the getenv script into any other macros on the same device
 *    - access ENV variables from macros once 'env-ready' event is emmitted
 * 
 * Note: if a variable is not found in ENV, '' is returned (empty)
 * 
 */

const xapi = require('xapi');


// Fired when the environnment Macro is ready to provide ENV variables
xapi.on('env-ready', async (ready) => {

   if (!ready) {
      console.log('ENV macro is not responding?, aborting...');
      return;
   }

   // Example
   let variable = 'DEVICE_SECRET'
   let secret = await getenv(variable);
   console.log(`echo \$${variable} = ${secret}`);
})


//
// getenv() 
//

// Asks the 'Environment' macro to send the value of an environment variable
const ENV_TIMEOUT = 500; // delay for the environment macro to respond
function getenv(variable) {

   return new Promise((resolve, reject) => {

      let context = {}
      // Wait for response from 'Environment' macro
      context.stop = xapi.event.on("Message Send Text", function (msg) {

         let parsed;
         try {
            parsed = JSON.parse(msg);
         }
         catch (err) {
            console.debug(`cannot JSON parse "MessageSent" event: ${msg}: it's ok, simply ignoring this event`);
            return;
         }

         let data = parsed;
         if (data.operation && (data.operation == "get_response")) {
            console.debug(`received value: "${data.value}" for env variable: "${data.env}"`);

            // Check this is the variable we have requested
            if (variable != data.env) {
               console.debug(`received incorrect variable, ${data.env} instead of ${variable}, ignoring...`);
               return;
            }

            // If found, stop listening
            if (context.stop) {
               console.debug(`unsubscribe from "Message Send" events, for variable: ${variable}`);
               context.stop();
               delete context.stop;
            }

            resolve(data.value);

            return;
         }

         console.debug(`ignoring "Message Sent" event, not a get_response: ${msg}`);
      });

      // Send request to get the value for the variable
      let data = {
         'operation': 'get',
         'env': variable
      };
      xapi.command('Message Send', { Text: JSON.stringify(data) }).then(() => {

         // The Environment macro should respond before TIMEOUT
         setTimeout(() => {
            if (context.stop) {
               console.debug(`unsubscribe from Message send for: ${variable}`);
               context.stop();
               delete context.stop;
            }

            let error = new Error('Environment Timeout');
            error.code = "TIMEOUT";
            return reject(error);
         }, ENV_TIMEOUT);
      });

   });
}

// Introduce a new event 'env-ready' that fires when 'Environment' macro is ready:
//
//     xapi.on('env-ready')
//
const ENV_RETRY_DELAY = 500;
xapi.on('ready', async () => {
   const NB_RETRIES = 4;
   let retries = 0;
   while (retries < NB_RETRIES) {
      if (await checkEnvironmentIsReady()) {
         xapi.emit('env-ready', true);
         return;
      }
      else {
         // Wait exponentially before retrying 
         // note: this elapsed time comes on top of the ENV_TIMEOUT for the 'getenv()' function 
         await timeout(retries * retries * ENV_RETRY_DELAY);
         retries++;
      }
   }

   console.debug(`no response from the ENV macro after ${NB_RETRIES} tentatives, is it running?`);
   xapi.emit('env-ready', false);
});
function timeout(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}
async function checkEnvironmentIsReady() {
   try {
      let value = await getenv('PING');
      if ('PONG' == value) {
         console.debug('PING => PONG: good to proceed...')
         console.debug('"Environment" macro is operational');
         return true;
      }
      else {
         console.debug('Environment" macro is NOT operational: unexpected value');
         return false;
      }
   }
   catch (err) {
      if (err.code == 'TIMEOUT') {
         console.debug('Environment" macro is NOT operational: timeout');
         return false;
      }

      console.debug('"Environment" macro is NOT operational: unexpected error');
      return false;
   }
}
//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Implements Environment Variables for Macro:
 *    A* environment.js  : this macro manages ENV variables (stores, returns values)
 *    B. getenv.js       : this is not a macro but a code snippet that you insert into existing macros to retrieve ENV variables (local to your device)
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

// List of variables for the environment
const ENV = {
   'PING': 'PONG'

   // ADD environment variables below
   //, 'SECRET' : 1234 
};

xapi.event.on('Message Send Text', (msg) => {
   console.debug(`new "Message Send" Event with text: ${msg}`);

   // WORKAROUND: needed if message was sent from the cloud via POST https://api.ciscospark.com/v1/xapi/command/message.send
   msg = msg.replace(/\'/g, '"');
   let parsed;
   try {
      parsed = JSON.parse(msg);
   }
   catch (err) {
      console.err(`cannot JSON parse the text in 'Message Send' Event: ${msg}, ignoring...`);
      return
   }

   let data = parsed;
   if (!data.env) {
      console.debug(`"Message Send" Event is not about Env: ${msg}, ignoring`);
      return;
   }

   console.debug(`"Message Sent" event concerns env variable: "${data.env}"`);

   // GET ENV
   if (data.operation && (data.operation == 'get')) {

      if (!data.env) {
         console.warn(`no ENV variable specified in: "${msg}", ignoring...`);
         return;
      }

      console.debug(`requested value for env variable: "${data.env}"`);
      let response = {
         'env': data.env,
         'operation': 'get_response',
         'value': '' // default to '' if variable is not found
      }
      let value = ENV[data.env];
      if (value) {
         response.value = value;
      }

      // Publish value for ENV variable
      xapi.command('Message Send', { Text: JSON.stringify(response) });
      return;
   }

   // RESPONSE provided => ignore
   if (data.operation && (data.operation == 'get_response')) {
      console.debug(`ignoring get_response type of "Message Sent" event: ${msg}`);
      return;
   }

   // SET ENV
   // Note that the storage is volatile (dynamically added variables will be lost every time the macro or runtime is restared)
   if (data.operation && (data.operation == 'set')) {
      console.log(`setting value: "${data.value}" for env variable: "${data.env}"`);

      ENV[data.env] = data.value;
      return;
   }

   console.warn(`operation for "Message Sent" event is not supported:"${msg}, ignoring...`);
   return;
})

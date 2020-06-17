//
// Copyright (c) 2019 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Listen to events sent from a remote Codec using the Message command and an HttpClient POST
 * This code needs a primary: install the primary.js macro on the remote Codec
 * 
 */
const xapi = require('xapi');

function parse(event) {
   return JSON.parse(event);
}

xapi.event.on('Message Send Text', event => {
   event = event.replace(/'/g, '"');
   try {
      var command = parse(event);
      for (var key in command) {
         console.debug(`processing command: ${key}`)
         xapi.command(key, command[key]);
      }
   } catch (err) {
      console.log(`cannot parse event: ${err.message}`);
   }
});

console.log('secondary started');
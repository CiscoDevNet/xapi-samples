/**
 * Illustrates how to pass messages among local macros
 * 
 * see 12-master and 12-slave examples for communication through remote codecs
 */

const xapi = require('xapi');


xapi.event.on("Message Send Text", (text) => {

   // Decode if necessary (example: message sent over xAPI cloud)
   let decoded = text.replace(/\'/g, '"');

   // Parse JSON and print
   let data = JSON.parse(decoded);
   console.log(`Received score: ${data.score}, for player: ${data.player}`);
});


let data = {
   score: 5,
   player: "Stève"
}

// Serialize as JSON
const serialized = JSON.stringify(data);

// [CONFIRM] Encoding is needed only if sending over HTTP
const encoded = serialized.replace(/"/g, "\'");

xapi.command("Message Send", { Text: encoded });
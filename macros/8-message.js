/**
 * Illustrates how to pass messages among macros, or to external APIs (via HTTP Feedback)
 */

const xapi = require('xapi');

xapi.event.on("Message Send Text", (text) => {
  // Decode (from naive implementation) and deserialize
  let decoded = text.replace(/\'/g, '"')
  let data = JSON.parse(decoded)
  
  console.log(`Received score: ${data.score}, for player: ${data.player}`)
})


let data = {
  score : 5,
  player : "Stève"
}

// Serialize and encode
// [WORKAROUND] as Duktape does not provide encoders, provide a naive implementation
const serialized = JSON.stringify(data)
const encoded = serialized.replace(/"/g, "\'")

xapi.command("Message Send", { Text: encoded  })
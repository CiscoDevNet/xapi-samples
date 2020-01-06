/**
 * Post API requests to a Hue Bridge
 *
 */

const xapi = require("xapi")

// Update for your Hue deployment
const BRIDGE_IP = "192.168.1.33";
const BRIDGE_USER = "SECRET";
const LIGHT_ID = 1; // number of your Bulb as registered at your Hue Bridge

// Change color
const color = 25500;
sendToBridge(BRIDGE_IP, BRIDGE_USER, LIGHT_ID, "Put", { "hue": color });


function sendToBridge(bridgeip, username, light, verb, payload) {

   xapi.command("HttpClient " + verb, {
      Header: ["Content-Type: application/json"],
      Url: `http://${bridgeip}/api/${username}/lights/${light}/state`,
      AllowInsecureHTTPS: "True",
      ResultBody: "plaintext"
   },
      JSON.stringify(payload))
      .then((response) => {

         console.log(`request sent to the bridge, status code: ${response.StatusCode}`);
         console.debug(`received response: ${response.Body}`);

         // Check response
         let result = JSON.parse(response.Body);
         if (result[0] && (result[0].success)) {
            console.log("success");
            return;
         }

         if (result[0] && (result[0].error)) {
            console.log("error");
            console.debug(result[0].error.Message);
            return;
         }

         console.warn(`unexpected response: ${Object.keys(result[0])}`);
         return;
      })
      .catch((err) => {
         console.log("Could not contact the bridge");
         console.debug("failed with err: " + err.message);
      })
}

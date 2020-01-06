/**
 * Posts a message to a Webex Teams space via a Bot account
 *
 * Prep work:
 *      from a ssh session, type the commands below:
 *      > xConfiguration HttpClient Mode: On
 *      > xConfiguration HttpClient AllowInsecureHTTPS: True
 * 
 * Example for tshell:
 *      > xcommand HttpClient Post 
 *          Url: https://api.ciscospark.com/v1/messages 
 *          Header: "Content-Type: application/json" 
 *          Header: "Authorization: Bearer BOT_TOKEN"
 *          ResultBody: "plaintext"
 *          AllowInsecureHTTPS: True
 *      > {"markdown":"hey, this is Steve","roomId":"ROOM_ID"}
 *      > .
 * 
 *
 */

const xapi = require('xapi');

// Replace with your bot token
const token = "BOT_TOKEN";
// replace with a space your bot is part of
const roomId = "ROOM_ID";

function push(msg, cb) {

   // Post message
   let payload = {
      "markdown": msg,
      "roomId": roomId
   }
   xapi.command(
      'HttpClient Post',
      {
         Header: ["Content-Type: application/json", "Authorization: Bearer " + token],
         Url: "https://api.ciscospark.com/v1/messages",
         AllowInsecureHTTPS: "True",
         ResultBody: 'plaintext'
      },
      JSON.stringify(payload))
      .then((response) => {
         console.debug(`received response with status code: ${response.StatusCode}`);

         if (response.StatusCode == 200) {
            console.log("message pushed to Webex Teams");

            // Retrieve message id
            let result = JSON.parse(response.Body);
            console.log(`message id: ${result.id}`);
            if (cb) cb(null, result.id);
            return;
         }

         // This should not happen as Webex REST API always return 200 OK for POST requests
         console.log("failed with status code: " + response.StatusCode);
         if (cb) cb("failed with status code: " + response.StatusCode, response.StatusCode);
      })
      .catch((err) => {
         console.log(`failed with err message: ${err.message}`);

         switch (err.message) {
            case 'Unknown command':
               // Can be caught at coding time
               console.log("seems a wrong HttpClient Verb is used");
               break;

            case 'HttpClientPostResult':
            case 'HttpClientDeleteResult':
               console.log(`failed with err status: ${err.data.status}`);
               console.log(Object.keys(err.data));
               if (err.data.status === 'Error') {

                  // Typically: hostname not found  
                  if (err.data.Message) {
                     console.log("data message: " + err.data.Message);
                     break;
                  }

                  // Typically: the response status code is 4xx or 5xx
                  if (err.data.StatusCode) {
                     console.log("status code: " + err.data.StatusCode);

                     // Note: err.data.Headers can also be retrieved, though not the body of the response (no ResponseBody attribute here)
                     break;
                  }
               }
         }

         if (cb) cb("Could not post message to Webex Teams", null);
      })
}

push('Hey, this is Steve', console.log);

/*
xapi.event.on('UserInterface Extensions Event Clicked', (event) => {
    console.log(`new event from: ${event.Signal}`)

     // Push info about the session
     push('Hello World')
})
*/
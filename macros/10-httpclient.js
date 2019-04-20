/**
 * Posts a message to a Webex Teams space via a Bot Account
 */


/*
 * Prep work:
 *      from a ssh session, type the commands below:
 *      > xConfiguration HttpClient Mode: On
 *      > xConfiguration HttpClient AllowInsecureHTTPS: True
 *
 */

// Replace with your bot token
const token = "YOUR_BOT_TOKEN"
// replace with a space your bot is part of
const roomId = "Y2lzY29zcGFyazovL3VzL1JPT00vMTQ0YTc0NTAtZWM1MS0xMWU4LWExZDAtYWRlYjI4NDZjZmI1"

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
            AllowInsecureHTTPS: "True"
        },
        JSON.stringify(payload))
        .then((response) => {
            if (response.StatusCode == 200) {
                console.log("message pushed to Webex Teams");
                if (cb) cb(null);
                return;
            }
        })
        .catch((err) => {
            console.log("failed: " + err.message)
            if (cb) cb("Could not post message to Webex Teams")
        })
}

push('Hello World')

/*
xapi.event.on('UserInterface Extensions Event Clicked', (event) => {
    console.log(`new event from: ${event.Signal}`)

     // Push info about the session
     push('Hello World')
})
*/

/**
 * Posts a message to a Webex Teams space via a Bot Account
 *
 * Prep work:
 *      from a ssh session, type the commands below:
 *      > xConfiguration HttpClient Mode: On
 *      > xConfiguration HttpClient AllowInsecureHTTPS: True
 * 
 */

// Replace with your bot token
const token = "YOUR_BOT_TOKEN"
// replace with a space your bot is part of
const roomId = "TEAMS_ROOMID"

function push(msg, cb) {

    // Post message
    let payload = {
        "markdown": msg,
        "roomId": roomId
    }

    // For the record, the code below correspond to the TSH command
    //    > xcommand HttpClient Post
    //        Url: https://api.ciscospark.com/v1/messages
    //        Header: "Content-Type: application/json"
    //        Header: "Authorization: Bearer BOT_TOKEN" \
    //        AllowInsecureHTTPS: True
    //    > {"markdown":"hey, this is Steve","roomId":"TEAMS_ROOMID"}
    //    > .
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
                console.log("message pushed to Webex Teams")

                // Retrieve message id
                let result = JSON.parse(response.Body)
                console.log(`message id: ${result.id}`)
                if (cb) cb(null, result.id)
                return
            }

            console.log("failed with status code: " + response.StatusCode)
            if (cb) cb("failed with status code: " + response.StatusCode, response.StatusCode)
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

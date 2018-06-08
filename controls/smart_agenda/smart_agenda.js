//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Listen to UserInterfaace realtime events via xAPI's feedback function
 * Pushes events to an incoming Webhook
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.log("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.log("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}

// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
console.log("connecting to your device...");
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password
});
xapi.on('error', (err) => {
    switch (err) {
        case "client-socket":
            console.error("Could not connect: invalid URL.");
            break;

        case "client-authentication":
            console.error("Could not connect: invalid credentials.");
            break;

        case "client-timeout":
            console.error("Could not connect: timeout.");
            break;

        default:
            console.error(`Encountered error: ${err}.`);
            break;
    }

    console.log("exiting...");
    process.exit(1);
});


//
// Code logic
//

xapi.on('ready', () => {
    console.log("connexion successful");

    // Listen to custom In-Room Controls events
    console.log("Added feedback listener to: UserInterface Extensions Event Clicked");
    xapi.event.on('UserInterface Extensions Event Clicked', (event) => {
        console.log(`New event from: ${event.Signal}`);

        // Identify session associated to button
        let sessionId = extractSession(event.Signal);
        if (!sessionId) {
            console.log("bad format, ignoring...");
            return;
        }

        // Push info about the session
        const sessions = require('./sessions')
        let session = getInfo(sessionId);
        let href = "https://www.ciscolive.com/us/learn/sessions/session-catalog/?search=" + sessionId;
        push(`${session.day}, ${session.time}: **${session.title}** - [${session.id}](${href}) _at ${session.location}_`);
    });
});

function extractSession(component) {
    let parsed = component.match(/^push_(DEVNET-\d{4})$/);

    if (!parsed) {
        console.log("format error, please comply with 'push_DEVNET-DDDD'");
        return undefined;
    }

    return parsed[1];
}

// Post message to the 'Survey Responses space'
function push(msg, cb) {
    var request = require("request");

    // Incoming webhook id
    let webhook_id = process.env.SURVEY_RESULTS_SPACE || "Y2lzY29zcGFyazovL3VzL1dFQkhPT0svOGQ3MDU5YTgtNTJjZi00MzdjLWI5OTUtOWE4N2Y3ZGFiMDk5";
    let options = {
        method: 'POST',
        url: 'https://api.ciscospark.com/v1/webhooks/incoming/' + webhook_id,
        headers: { 'Content-Type': 'application/json' },
        body: { markdown: msg },
        json: true
    };

    request(options, function (err, response, body) {
        if (err) {
            if (cb) cb(err.message);
            return;
        }

        if (response.statusCode == 204) {
            if (cb) cb(null);
            return;
        }

        if (cb) cb("Could not post message to Webex Teams");
    });
}

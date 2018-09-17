//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Example of a panel that prompts for a Webex Teams email
 * Pushes notification to this email via a Bot account
 */

//
// State of the In-Room Control
// Note: this is a global variable used by the controller to interact with the component
var gstate = {
    xapi: undefined,
    email: undefined,
    accessToken: process.env.ACCESS_TOKEN,
    version: require('./package.json').version
}

// Initialize the Webex Teams access token
if (!gstate.accessToken) {
    console.log("Warning: no token detected.");
    console.log("Please use the ACCESS_TOKEN env variable as in:");
    console.log("Bash example: ACCESS_TOKEN=XXXXXX JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node to_webex_teams.js");
    console.log("Continuing... but won't push messages to Webex Teams");
}

//
// Connect to the CE device
//

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.log("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.log("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}
// Updating state
gstate.url = process.env.JSXAPI_DEVICE_URL;
gstate.username = process.env.JSXAPI_USERNAME;
// Empty passwords are supported
gstate.password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
console.log("connecting to your device...");
const jsxapi = require('jsxapi');
const xapi = jsxapi.connect(gstate.url, {
    username: gstate.username,
    password: gstate.password
});
xapi.on('error', (err) => {
    switch (err) {
        case "client-socket":
            console.error(`Could not connect, invalid URL: ${gstate.url}`);
            break;

        case "client-authentication":
            console.error(`Could not connect: invalid credentials for user: ${gstate.username}`);
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
    gstate.xapi = xapi;

    // Complete state initializion (from UI components)
    readEmailFromUI(gstate);

    // Listen to custom In-Room Controls events
    console.log("added feedback listener to: UserInterface Extensions Event Clicked");
    gstate.xapi.event.on('UserInterface Extensions Event Clicked', (event) => {

        console.log(`new event from: ${event.Signal}`);
        fireAction(event.Signal);
    });

    // Initialize the widgets also as the controls are deployed
    gstate.xapi.event.on('UserInterface Extensions Widget LayoutUpdated', (event) => {
        console.log(`layout updated, let's refresh the widgets`);
        updateUI();
    });
});


function fireAction(widgetId) {
    switch (widgetId) {
        // Recipients panel
        case "update_email":
            updateEmail();
            return;
        case "reset_email":
            resetEmail();
            return;

        // Notify panel
        case "send_where_are_you":
            sendNotification("Where are you?");
            return;

        case "send_meeting_canceled":
            sendNotification("FYI, meeting cancelled");
            return;

        case "send_what_about_coffee":
            sendNotification("What about coffee!");
            return;

        default:
            console.log("unknown action");
            return;
    }
}


function sendNotification(message) {
    // If no email has been specified, push an alert message
    if (!gstate.email) {
        xapi.command('UserInterface Message TextLine Display', {
            Text: `Please enter an email address for the recipient`,
            Duration: 20, // in seconds
        });
        return;
    }

    const request = require("request");
    const options = {
        method: 'POST',
        url: 'https://api.ciscospark.com/v1/messages',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + gstate.accessToken
        },
        body: {
            toPersonEmail: gstate.email,
            text: message,
        },
        json: true
    };

    request(options, function (err, response, body) {
        if (err) throw new Error(err);

        switch (response.statusCode) {
            case 200:
                console.log("notification posted");
                return;

            case 401:
                console.log("WARNING: authentication error. Please check the provided token");
                return;

            case 404:
                console.log("cannot post message: the email address is not a valid Webex Teams handle");
                return;

            default:
                console.log(`cannot post message, got status code: ${response.statusCode}`);
                return;
        }
    });
}

function updateEmail() {

    // Prompt for an email
    gstate.xapi.command('UserInterface Message TextInput Display', {
        FeedbackId: 'email',
        Title: "Webex Teams handle",
        Text: 'please enter an email',
    });

    // Prompt callback
    gstate.xapi.event.on('UserInterface Message TextInput Response', (event) => {
        if (event.FeedbackId === 'email') {
            let parts = event.Text.split('@');
            if (parts.length != 2) {
                console.log("bad email format, aborting...");
                return;
            }

            // Showing only the domain for privacy reasons
            console.log(`Changing email to ...@${parts[1]}`)
            gstate.email = event.Text;
            updateUI();
        }
    });
}

function resetEmail() {
    gstate.email = "";
    updateUI();
}

function updateUI() {
    // Update email textfield
    gstate.xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'recipient_email',
        Value: gstate.email
    });

    // Update version textfield
    gstate.xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'status_version',
        Value: gstate.version
    });
}


function readEmailFromUI(state) {

    // Look for the recipient's email widget
    gstate.xapi.status.get("UserInterface Extensions Widget")
        .then((widgets) => {
            //console.log(`found ${widgets.length} widgets`);
            let found = false;
            widgets.forEach(elem => {
                if (elem.WidgetId == "recipient_email") {
                    console.log("found recipient email");
                    found = true;

                    // No address
                    if (elem.Value === "") {
                        console.log("no email address set yet");
                        gstate.email = null;
                    }
                    else {
                        console.log("initializing email from the deployed control");
                        gstate.email = elem.Value;
                    }
                }
            });

            if (!found) {
                console.log("ERROR: the Notifier control is not deployed");

                // Display alter on Touch10 interface or screen
                gstate.xapi.command('UserInterface Message Alert Display', {
                    Title: 'Notifier Control',
                    Text: 'The In-Room Control is not deployed on the device',
                    Duration: 30 // in seconds
                });
            }
        })
}


//
// Startup sequence 
console.log("starting Notifier v" + require("./package.json").version);

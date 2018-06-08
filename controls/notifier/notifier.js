//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Example of a panel that prompts for a user email
 * 
 */

//
// State of the In-Room Control
// Note: this is a global variable used by the controller to interact with the component
var gstate = {
    xapi: undefined,
    email: undefined
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

        console.log(`New event from: ${event.Signal}`);
        fireAction(event.Signal);
    });

    // Initialize the widgets also as the controls are deployed
    xapi.event.on('UserInterface Extensions Widget LayoutUpdated', (event) => {
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
    xapi.command('UserInterface Message TextLine Display', {
        Text: `Message for ${gstate.email}: ${message}`,
        Duration: 20, // in seconds
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
            var parts = event.Text.split('@');
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
}


function readEmailFromUI(state) {

    // Look for the recipient's email widget
    state.xapi.status.get("UserInterface Extensions Widget")
        .then((widgets) => {
            //console.log(`found ${widgets.length} widgets`);
            let found = false;
            widgets.forEach(elem => {
                if (elem.WidgetId == "recipient_email") {
                    console.log("found recipient email");
                    found = true;
                    gstate.email = elem.Value;
                }
            });

            if (!found) {
                console.log("ERROR: the Notifier control is not deployed");

                // Display alter on Touch10 interface or screen
                xapi.command('UserInterface Message Alert Display', {
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

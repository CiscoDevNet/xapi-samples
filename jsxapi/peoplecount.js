//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Registers an HTTP Webhook to receive People Count events from the Room Devices.
 * Note that HttpFeedback is the exact xAPI terminology.
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_URL || !process.env.JSXAPI_USERNAME) {
    console.info("Please specify info to connect to your device as JSXAPI_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.info("Bash example: JSXAPI_URL='ssh://10.10.1.52' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}

// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to a device
const xapi = jsxapi.connect(process.env.JSXAPI_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password,
});

// Errors management
xapi.on('error', (type) => {
    switch (type) {
        case "client-socket":
            console.error("Could not connect: invalid URL.");
            process.exit(1);

        case "client-authentication":
            console.error("Could not connect: invalid credentials.");
            process.exit(1);

        case "client-timeout":
            console.error("Could not connect: timeout.");
            process.exit(1);

        default:
            console.log(`encountered error, type: ${type}, continuing`);
    }
});


//
// Code logic
//

// Listen to events
console.log('Start listening...');
xapi.feedback.on('Status/Audio/Volume', data => {
    console.log(`Received feedback data: ${data}`);
  });



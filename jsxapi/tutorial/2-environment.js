//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Reads connection info from environment variables
 */

//
// Connect to the device
//

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.info("Please specify info to connect to your device as JSXAPI_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.info("Bash example: JSXAPI_DEVICE_URL='ssh://10.10.152' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}
// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
const jsxapi = require('jsxapi');
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
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
            console.error(`Encountered error: ${type}.`);
            process.exit(1);
    }
});

xapi.on('ready', () => { console.debug("connexion successful"); } );


//
// Code logic
//

// Display current audio volume
xapi.status
    .get('Audio Volume')
    .then((level) => {
        console.log(`Current volume level: ${level}`);
    });

// Reset volume to 50
xapi.command('Audio Volume Set', { Level: "50" })
    .then((result) => {
        console.log(`Reset volume: ${result.status}`);
    })
    .catch((error) => { 
        console.log(`Cannot reset volume, reason: ${error.message}`)
    });

// Gracefully ends after delay
const delay = 5; // in seconds
setTimeout(() => {
    console.log('Exiting...');
    xapi.close();
    process.exit(0);
}, delay * 1000);
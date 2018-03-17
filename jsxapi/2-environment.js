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
    console.info("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}
// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
const jsxapi = require('jsxapi');
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password
});

// Errors management
xapi.on('error', (err) => {
    switch (err) {
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
            console.error(`Encountered error: ${err}.`);
            process.exit(1);
    }
});


//
// Code logic
//

xapi.on('ready', () => {
    console.log("connexion successful");

    // Display current audio volume
    xapi.status
        .get('Audio Volume')
        .then((level) => {
            console.log(`Current volume level: ${level}`);
        })
        .then(() => {
            // Gracefully ends after delay
            const delay = 5; // in seconds
            setTimeout(() => {
                // End
                console.log('Exiting.');
                xapi.close();
            }, delay * 1000);
            console.log(`Will exit gracefully in ${delay} seconds...`);
        })
});

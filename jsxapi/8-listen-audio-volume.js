//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Listens to "Status Audio Volume" changes as they happen on the device.
 */


//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.log("Please specify info to connect to your device as JSXAPI_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
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
    console.error(`connexion failed: ${err}, exiting`);
    process.exit(1);
});


//
// Code logic
//

xapi.on('ready', () => {
    console.log("connexion successful");

    // Listen to events
    console.log('Please press the Audio (+) / (-) buttons');
    const off = xapi.status.on('Audio Volume', (volume) => {
        console.log(`Volume changed to: ${volume}`)
    });

    // Stop listening after delay
    const delay = 20; // in seconds
    setTimeout(() => {
        console.log('Exiting.');

        // De-register feedback
        off();
        xapi.close();

    }, delay * 1000);
    console.log(`Will stop listening and exit in ${delay} seconds...`);

});

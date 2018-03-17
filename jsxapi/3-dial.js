//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Dials a demo SIP address, and closes the call after 30 seconds
 */


//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.info("Please specify info to connect to your device as JSXAPI_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.info("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}

// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
console.debug("connecting to your device...");
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

    // Start a call
    xapi.command('Dial', { Number: 'roomkit@sparkdemos.com' })
        .then((call) => {
            console.log(`Started call with status: ${call.status}, id: ${call.CallId}`);

            // Stop call after delay
            const delay = 20;
            setTimeout(() => {
                console.log('Disconnecting call, and exiting.');

                xapi.command('Call Disconnect', { CallId: call.CallId })
                    .then(process.exit);
            }, delay * 1000);
            console.log(`Call with be disconnected in ${delay} seconds...`);

        })
        .catch((err) => {
            // Frequent error here is to have several on-going calls
            // reason: "Maximum limit of active calls reached"
            console.error(`Error in call: ${err.message}`)
        });
});

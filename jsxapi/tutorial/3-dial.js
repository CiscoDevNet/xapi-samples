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
    console.info("Bash example: JSXAPI_DEVICE_URL='ssh://10.10.1.52' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}

// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to a device
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password,
});
xapi.on('error', (error) => { 
    console.debug(`connexion failed: ${error.message}, exiting`);  
    process.exit(1);
});
xapi.on('ready', () => { console.debug("connexion successful"); } );


//
// Code logic
//

// Start a call
xapi.command('Dial', { Number: 'roomkit@sparkdemos.com' })
    .then((call) => {
        console.log(`Started call with status: ${call.status}, id: ${call.CallId}`);

        // Stop call after delay
        const delay = 20;
        setTimeout(() => {
            console.log('Stopping call...');

            xapi.command('Call Disconnect', { CallId: call.CallId })
            .then(process.exit);
        }, delay * 1000);

    })
    .catch((error) => {
        // Frequent error here is to have several on-going calls
        // reason: "Maximum limit of active calls reached"
        console.log(`Error in call: ${error.message}`)
    });

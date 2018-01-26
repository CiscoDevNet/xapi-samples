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

// Fetch current count
xapi.status
.get('RoomAnalytics PeopleCount')
.then((count) => {
    console.log(`Initial count is: ${count.Current}`);
});

// Listen to events
console.log('Adding feedback listener to: RoomAnalytics PeopleCount');
xapi.feedback.on('/Status/RoomAnalytics/PeopleCount', (count) => {
    console.log(`Current count is: ${count.Current}`);
  });





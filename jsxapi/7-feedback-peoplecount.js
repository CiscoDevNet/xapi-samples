//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Listen to realtime events via xAPI's feedback function
 * In this example, we display people count changes as they happen
 * 
 * /!\ This example only works when run against a 'RoomKit' type of device
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.log("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.log("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node 7-feedback-peoplecount.js");
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

    // Fetch current count
    xapi.status
        .get('RoomAnalytics PeopleCount')
        .then((count) => {
            console.log(`Initial count is: ${count.Current}`);

            // Listen to events
            console.log('Adding feedback listener to: RoomAnalytics PeopleCount');
            xapi.feedback.on('/Status/RoomAnalytics/PeopleCount', (count) => {
                console.log(`Updated count to: ${count.Current}`);
            });

        })
        .catch((err) => {
            console.log(`Failed to fetch PeopleCount, err: ${err.message}`);
            console.log(`Are you interacting with a RoomKit? exiting...`);
            xapi.close();
        });
});

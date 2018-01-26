//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Modify some of your device's configuration settings
 * In this example, we'll change the Halfwake and Awake messages
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.info("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.info("Bash example: JSXAPI_DEVICE_URL='ssh://10.10.1.52' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
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
// Custom logic
//

xapi.on('ready', () => {
    console.log("connexion successful");

    // Update Halfwake message
    xapi.config.set('UserInterface OSD HalfwakeMessage', "I am API addict")
        .then(() => {
            console.info('updated HalfwakeMessage')
        })
        .catch((err) => {
            console.error(`could not update Halfwake message : ${err.message}`)
        });

    // Update Awake message
    xapi.config.set('UserInterface CustomMessage', "I am G33K")
        .then(() => {
            console.log('updated Awake message')

            // Ending script
            xapi.close();
        })
        .catch((err) => {
            console.error(`could not update Awake message : ${err.message}`)
        });
});

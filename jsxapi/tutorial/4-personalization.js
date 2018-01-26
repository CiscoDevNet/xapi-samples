//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Modify some of your device's configuration settings
 * In this example, we'll change the Halfwake and Activated messages
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

// Connect to a device
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password,
});
xapi.on('error', (error) => {
    console.debug(`connexion failed: ${error.message}, exiting`);
    process.exit(1);
});
xapi.on('ready', () => { console.debug("connexion successful"); });


//
// Custom logic
//

// Update Halfwake message
xapi.config.set('UserInterface OSD HalfwakeMessage', "I am API addict")
    .then(() => {
        console.info('updated HalfwakeMessage')
    })
    .catch((err) => {
        console.error(`could not update HalfwakeMessage : ${err.message}`)
    });

// Update Welcome message
xapi.config.set('UserInterface CustomMessage', "I am G33K")
.then(() => {
    console.info('updated CustomMessage')
})
.catch((err) => {
    console.error(`could not update CustomMessage : ${err.message}`)
});





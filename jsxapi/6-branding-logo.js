//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * In this example, we'll update the Branding logo in Halfwake mode
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.log("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
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
xapi.on('ready', () => {
    console.log("connexion successful");

    let encoded;
    try {
        // Read binary data
        const fs = require('fs');
        const bitmap = fs.readFileSync("./img/create-logo-transparent.png");

        // Convert binary data to base64 encoded string
        encoded = new Buffer(bitmap).toString('base64');

        console.log("image encoding successful");
    }
    catch (err) {
        console.error(`could not read image: ${err.message}, exiting`);
        process.exit(1);
    }

    // Update Awake message
    xapi.command('UserInterface Branding Upload', {
        Type: 'HalfwakeBranding',
        body: encoded
    })
        .then(() => {
            console.log('updated Branding logo in Halfwake mode');

            // Switch to Halwake mode
            xapi.command('Standby Halfwake')
                .then(() => xapi.close());
        })
        .catch((err) => {
            console.error(`could not update Brand logo: ${err.message}`);
            xapi.close();
        });
});

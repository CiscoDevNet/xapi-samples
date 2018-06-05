//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Make Custom Wallpaper do update by rebooting the device as new background images are pushed
 * 
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.log("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.log("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.32' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
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

    xapi.event.on('UserInterface Branding Updated', function (event) {
        // Was the background been updated ?
        if (event.Type == "Background") {
            console.log("New wallpaper pushed to system");

            // Restart the device to update the wallpaper
            xapi.command('SystemUnit Boot', {
                'Action' :'Restart'
            })
            .then(() => {
                console.log("Restarting device to update Wallpaper");
            })
            .catch((err) => {
                console.log(`Could not restart device: ${err.message}`);
            })
        }
    });
});

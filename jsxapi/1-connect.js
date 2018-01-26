//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Script that connects to a device, and checks for errors at connection
 * then displays current volume level, and attempts to change level if authorized
 * and finally exists gracefully.
 * 
 * /!\ Changing the volume level requires admin priviledges (not authorized from the integrator role)
 */

// Connect to the device
const jsxapi = require('jsxapi');
const xapi = jsxapi.connect("ssh://10.10.1.10", {
    username: 'admin',
    password: ''
});

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


xapi.on('ready', () => {
    console.log("connexion successful");

    // Display current audio volume
    xapi.status
        .get('Audio Volume')
        .then((level) => {
            console.log(`Current volume level: ${level}`);
        });

    // Reset volume to 50
    xapi.command('Audio Volume Set', { Level: "50" })
        .then((result) => {
            console.log(`Reset volume: ${result.status}`);

            // Ending script
            xapi.close();
        })
        .catch((err) => {
            console.error(`Cannot reset volume, reason: ${err.message}`)
        });
});

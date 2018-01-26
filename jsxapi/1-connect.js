//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Script that connects to a device, and checks for errors at connection
 * then displays current volume level, and attempts to change level if authorized
 * and finally exists gracefully after 5 seconds.
 */

// Connect to the device
const jsxapi = require('jsxapi');
const xapi = jsxapi.connect("ssh://10.10.1.10", {
    username: 'integrator',
    password: 'integrator',
});

xapi.on('error', (type) => {
    switch (type) {
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
            console.error(`Encountered error: ${type}.`);
            process.exit(1);
    }
});

xapi.on('ready', () => { console.debug("connexion successful"); } );


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
    })
    .catch((error) => { 
        console.log(`Cannot reset volume, reason: ${error.message}`)
    });

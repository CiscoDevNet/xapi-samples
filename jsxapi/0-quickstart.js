//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Simple script that connects to a device and shows the current volume level
 */

// Connect to the device
const jsxapi = require('jsxapi');
const xapi = jsxapi.connect("ssh://10.10.1.10", {
    username: 'integrator',
    password: ''
});
xapi.on('error', (err) => {
    console.error(`connexion failed: ${err}, exiting`);
    process.exit(1);
});

xapi.on('ready', () => {
    console.log("connexion successful");

    // Display current audio volume
    xapi.status
        .get('Audio Volume')
        .then((level) => {
            console.log(`Current volume level: ${level}`);

            // Ending script
            xapi.close();
        });
});

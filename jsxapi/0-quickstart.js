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
    password: 'integrator',
});
xapi.on('error', (error) => { 
    console.debug(`connexion failed: ${error.message}, exiting`);  
    process.exit(1);
});
xapi.on('ready', () => { console.debug("connexion successful"); } );


// Display current audio volume
xapi.status
    .get('Audio Volume')
    .then((level) => {
        console.log(`Current volume level: ${level}`);
    });

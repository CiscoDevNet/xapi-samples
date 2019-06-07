//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Auto-answer call example, filtering out not registered origins
 * 
 * Integrator role: not supported, as tested as of June 2018
 *     - OK: registering a feedback for /Call
 *     - KO: accepting an incoming call 
 *  * 
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

    // Listen to call events
    xapi.status
        .on('Call', (call) => {

            switch (call.Status) {
                case "Ringing":
                    console.log(`NEW call: ${call.id}`);

                    // Filter depending the origin of the call
                    if ((call.Direction == "Incoming")
                     && (call.Protocol == "Spark")
                     && (call.DisplayName == "Salon")) {

                        // Accept incoming call
                        console.log(`Accepting incoming call: ${call.id}`);
                        xapi.command('Call Accept', {
                            CallId: call.id
                        });
                    }
                    return;

                case "Connected":
                    console.log(`Connected call: ${call.id}`);
                    return;
                
                case "Disconnecting":
                    console.log(`Disconnecting call: ${call.id}`);
                    return;

                case "Idle":
                    console.log(`Idle call: ${call.id}`);
                    return;

                default:
                    //console.log("DEBUG: ignoring event");
                    return;
            }
        })
});

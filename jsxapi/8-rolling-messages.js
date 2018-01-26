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

// Connect to a device
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password,
});
xapi.on('error', (error) => {
    console.debug(`connexion failed: ${error.message}, exiting`);
    process.exit(1);
});


//
// Custom logic
//

function update(value) {

    // Update Awake message
    xapi.config.set('UserInterface CustomMessage', value)
        .then(() => {
            console.info('updated Awake message')
        })
        .catch((err) => {
            console.error(`could not update Awake message : ${err.message}`)
        });
}

let current = {}
current.options = []
current.iterations = 0
current.iterate = function (original, max) {
    // Reset options if array is empty 
    if (this.options.length === 0) {
        this.options = original
    }

    this.iterations++
    if (this.iterations > max) {
        clearInterval(current.timer)
        return
    }

    // Pop next option
    var choice = this.options.pop()
    update(choice)
}

xapi.on('ready', () => {
    console.debug("connexion successful");

    const delay = 3; //seconds
    const iterations = 10;
    console.log(`Starting loop to rool Awake messages every ${delay} with ${iterations} iterations`);
    current.timer = setInterval(function () {
        current.iterate(["Read a tutorial", "Launch a Sandbox", "Attend an event", "Pick a DevNet activity among:"], iterations)
    }, delay * 1000);
});



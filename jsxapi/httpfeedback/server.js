//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Registers an HTTP Webhook to receive People Count events from the Room Devices.
 * Note that HttpFeedback is the exact xAPI terminology.
 * 
 * /!\  The user must have admin access to the device. Integrators cannot register httpfeedbacks
 * 
 */


//
// Connect to a RoomKit device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.info("Please specify info to connect to your device as JSXAPI_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.info("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node example.js");
    process.exit(1);
}
if (!process.env.WEBHOOK_URL) {
    console.info("Please specify the URL to which events will be posted as a WEBHOOK_URL env variable");
    process.exit(1);
}
// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password,
});
xapi.on('error', (error) => {
    console.debug(`connexion failed: ${error.message}, exiting`);
    process.exit(1);
});
xapi.on('ready', () => {
    console.debug("connexion successful");

    // Registering webhook
    xapi.command('HttpFeedback Register', {
        FeedbackSlot: "2",
        ServerUrl: process.env.WEBHOOK_URL,
        Format: "JSON",
        Expression: "/Status/RoomAnalytics/PeopleCount"
    })
        .then((result) => {
            console.log(`successfully registered Webhook for PeopleCount, result: ${result.status}, on slot: ${result.FeedbackSlot}`);
        })
        .catch((error) => {
            console.log(`Could not register webhook against the device, reason: ${error.message}`);
            console.log(`Exiting...`);
            process.exit(1);
        });
});


//
// Server receive the events
// 

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var debug = require("debug")("samples");


var started = Date.now();
app.route("/")
    // healthcheck
    .get(function (req, res) {
        res.json({
            message: "Congrats, your Room Analytics Service is up and running",
            since: new Date(started).toISOString()
        });
    })

    // webhook endpoint
    .post(function (req, res) {

        // analyse incoming payload, should conform to Spark webhook trigger specifications
        debug("DEBUG: webhook invoked");
        if (!req.body) {
            console.log("WARNING: Unexpected payload received, aborting...");
            res.status(400).json({ message: "Bad payload" });
            return;
        }

        // event is ready to be processed, let's respond without waiting any longer
        res.status(200).json({ message: "message is being processed..." });

        // process incoming resource/event, see https://developer.ciscospark.com/webhooks-explained.html
        processEvent(req.body);
    });


// Starts the Bot service
//
// [WORKAROUND] in some container situation (ie, Cisco Shipped), we need to use an OVERRIDE_PORT to force our bot to start and listen to the port defined in the Dockerfile (ie, EXPOSE), 
// and not the PORT dynamically assigned by the host or scheduler.
var port = process.env.OVERRIDE_PORT || process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Cisco Spark Bot started at http://localhost:" + port + "/");
    console.log("   GET  / for health checks");
    console.log("   POST / to send Webhook events");
});


// Invoked every time an event flies to the webhook
function processEvent(payload) {
    //console.debug(`received new event`);

    const count =parseInt(payload.Status.RoomAnalytics.PeopleCount.Current.Value);
    console.log(`Count: ${count}`);
}
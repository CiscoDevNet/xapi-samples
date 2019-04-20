//
// Copyright (c) 2019 Cisco Systems
// Licensed under the MIT License 
//

/**
 * an In-Room Control that toogles a Hue bulb color, 
 * depending on the room's state: free, occupied, busy, on air (call in progress)
 * 
 */

// Goal: single codebase to run as a JS macro or Node.js process
// Let's detecting if running as a JS macro or as a Node.js process
const gstate = {}
try {
    /*
     * Running as a JS Macro
     */
    gstate.version = "0.1"

    gstate.xapi = require('xapi')

    // [ACTION] Update with your Hue Deployment
    gstate.hue = {
        bridge: '192.168.1.33',
        user: 'SECRET',
        light: 1
    }
}
catch (err) {
    /*
     * Running as a Node.js process
     */
    gstate.version = require("./package.json").version

    // Check args
    if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
        console.log("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
        console.log("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.32' JSXAPI_USERNAME='localadmin' JSXAPI_PASSWORD='ciscopsdt' node script.js");
        process.exit(1);
    }
    // Updating state
    gstate.device = {
        url: process.env.JSXAPI_DEVICE_URL,
        username: process.env.JSXAPI_USERNAME,
        password: (process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "")
    }

    // Connect to the device
    console.debug(`connecting to device via URL: ${gstate.device.url} ...`)
    const jsxapi = require('jsxapi')
    gstate.xapi = jsxapi.connect(gstate.device.url, {
        username: gstate.device.username,
        password: gstate.device.password
    })

    gstate.xapi.on('error', (err) => {
        switch (err) {
            case "client-socket":
                console.error(`Could not connect, invalid URL: ${gstate.url}`)
                break;

            case "client-authentication":
                console.error(`Could not connect: invalid credentials for user: ${gstate.username}`)
                break

            case "client-timeout":
                console.error("Could not connect: timeout.")
                break

            default:
                console.error(`Encountered error: ${err}.`)
                break
        }

        console.log("exiting...")
        process.exit(1)
    })

    // Hue Deployment
    if (!process.env.BRIDGE_IP) {
        console.log("Please specify the ip address of the Philipps Hue bridge as BRIDGE_IP env variable");
        process.exit(1);
    }
    if (!process.env.BRIDGE_USER) {
        console.log("Please specify the user token of the Philipps Hue bridge as BRIDGE_USER env variable");
        process.exit(1);
    }
    if (!process.env.LIGHT_NUMBER) {
        console.log("Please specify the light number as registered on the Philipps Hue bridge as LIGHT_NUMBER env variable");
        process.exit(1);
    }
    gstate.hue = {
        bridge: process.env.BRIDGE_IP,
        user: process.env.BRIDGE_USER,
        light: parseInt(process.env.LIGHT_NUMBER)
    }
}

gstate.xapi.on('ready', ready)

//
// Code logic
//

//
// State of the In-Room Control
// Note: this is a global variable used by the controller to interact with the component
const STATUS_INCALL = "InCall"
const STATUS_BUSY = "Busy"
const STATUS_OCCUPIED = "Occupied"
const STATUS_FREE = "Free"

function ready() {
    console.log("successfully connected to device")

    // Register UI event listeners from Human interactions
    // - widget Controls
    // - new Widget deployed
    gstate.xapi.event.on('UserInterface Extensions Event', fireAction)
    gstate.xapi.event.on('UserInterface Extensions Widget LayoutUpdated', layoutUpdated)

    // Init 'OnAir' status
    computeOnAirStatus(gstate.xapi).then((initialStatus) => {
        console.log(`computed initial OnAir status as: ${initialStatus}`)
        updateOnAirStatus(initialStatus)

        // Update 'OnAir' status from Codec fired events
        //    - NumberOfActiveCalls updates
        gstate.xapi.status.on("SystemUnit State NumberOfActiveCalls", (activeCalls) => {
            console.log(`state NumberOfActiveCalls changed to: ${activeCalls}`)
            computeOnAirStatus(gstate.xapi).then(updateOnAirStatus)
        })
        //   - DoNotDisturb updates
        gstate.xapi.status.on("Conference DoNotDisturb", (doNotDisturb) => {
            console.log(`conference DoNotDisturb status changed to: ${doNotDisturb}`)
            computeOnAirStatus(gstate.xapi).then(updateOnAirStatus)
        })
        //    - Standby updates
        gstate.xapi.status.on("Standby State", (standbyState) => {
            console.log(`state StandBy changed to: ${standbyState}`)
            computeOnAirStatus(gstate.xapi).then(updateOnAirStatus)
        })
    })
}

// Initialize onAirStatus by checking Codec 
async function computeOnAirStatus(xapi) {
    console.debug("computing OnAir status")

    // 1. Is a call active?
    const nbActiveCalls = await xapi.status.get('SystemUnit State NumberOfActiveCalls')
    console.debug(`nb of current active calls: ${nbActiveCalls}`)
    if (nbActiveCalls !== "0") {
        return STATUS_INCALL
    }

    // 2. Read the DoNotDisturb toogle
    const doNotDisturbStatus = await xapi.status.get('Conference DoNotDisturb')
    console.debug(`DoNotDisturb is currently: ${doNotDisturbStatus}`)
    if (doNotDisturbStatus === "Active") {
        return STATUS_BUSY
    }

    // 3. Check for presence? Presence can be inferred:
    //  - if DX80, from the standby state (especially if WakeupOnMotionDetection is on)
    //  - if Room Series, from the above AND the RoomAnalytics (Cout/Presence)
    // then
    //  A. we'll check Standby state
    const standbyState = await xapi.status.get('Standby State')
    console.debug(`Standby state is currently: ${standbyState}`)
    if (standbyState !== 'Standby') {
        return STATUS_OCCUPIED
    }
    //  B. if in Standby mode, we'll try to leverage with RoomAnalytics if supported
    try {
        const peopleCount = await xapi.status.get('RoomAnalytics PeopleCount Current')
        if (peopleCount === "-1") {
            console.debug("device is not counting, continuing...")
        }
        else if (peopleCount === "0") {
            console.debug("nobody's there, let's double check with Presence, continuing...")
        }
        else {
            console.debug(`Found ${peopleCount} faces`)

            // [TODO] Add a test so that if more than 1 person, may be worth considering as Busy, like in a meeting
            return STATUS_OCCUPIED
        }

        const peoplePresence = await xapi.status.get('RoomAnalytics PeoplePresence')
        console.debug(`Found presence: ${peoplePresence}`)
        if (peoplePresence === "Yes") {
            return STATUS_OCCUPIED
        }
    }
    catch (err) {
        console.debug(`RoomAnalytics not supported on this device, err code: ${err.code}, message: ${err.message}`)
    }

    // 4. Considering as free / not occupied
    return STATUS_FREE
}

function updateOnAirStatus(newStatus) {
    // [TODO] Robustness: has state changed? assuming it has changed for now...
    console.debug(`status was: ${gstate.onAirStatus}, changing to: ${newStatus}`)

    if (newStatus === gstate.onAirStatus) {
        // No change
        console.debug("no action to take")
        return
    }

    gstate.onAirStatus = newStatus;

    // Update User Interface
    refreshExtensions()
}

// Synchronizes the UI with the current global state
// - Control Panels, 
// - Light bulbs, 
// - Awake Message...
function refreshExtensions() {
    console.debug(`refresh request: synchronize the UI`);

    // Translate OnAirStatus to a human readable message
    let onAirMessage = "translate"
    switch (gstate.onAirStatus) {
        case STATUS_INCALL:
            onAirMessage = "DO NOT ENTER, no excuse"
            break

        case STATUS_BUSY:
            onAirMessage = "Not the best time, actively working"
            break

        case STATUS_OCCUPIED:
            onAirMessage = "All good: you can give Daddy a kiss"
            break

        case STATUS_FREE:
        default:
            onAirMessage = "Sorry, Dad's not here :-("
            break;
    }

    // Update Awake message
    console.log(`updating Awake message to: ${onAirMessage}`)
    gstate.xapi.config.set('UserInterface CustomMessage', onAirMessage)
        .then(() => {
            console.debug('successfully updated Awake message')
        })
        .catch((err) => {
            console.warn(`could not update Awake message to: ${onAirMessage}, err: ${err.message}`)
        });

    // Update In-Room Control Panel
    // console.log(`updating console OnAir to: ${onAirMessage}`)
    // gstate.xapi.command('UserInterface Extensions Widget SetValue', {
    //     WidgetId: 'onair_console_statusText',
    //     Value: onAirMessage
    // }).catch((err) => {
    //     console.warn(`error updating OnAir console text widget, err: ${err.msg}`);
    // });

    // Update Bulb
    toggleLight(true)
    switch (gstate.onAirStatus) {
        case STATUS_INCALL:
            changeColor(COLOR_RED)
            break

        case STATUS_BUSY:
            changeColor(COLOR_BLUE)
            break

        case STATUS_OCCUPIED:
        case STATUS_FREE:
        default:
            changeColor(COLOR_GREEN)
            break;
    }
}

//
// Interact with Hue Lights
//

const COLOR_RED = 65535
const COLOR_BLUE = 46920
const COLOR_GREEN = 25500

function changeColor(color) {
    console.log(`change color: ${color}`)
    updateLight(gstate.hue.bridge, gstate.hue.user, gstate.hue.light, { "hue": color }, console.debug)
}

function toggleLight(bool) {
    console.log(`toggle light to: ${bool}`)
    updateLight(gstate.hue.bridge, gstate.hue.user, gstate.hue.light, { "on": bool }, console.debug)
}

function updateLight(bridgeip, username, light, payload, cb) {
    console.debug('updateLight: pushing payload')
    console.debug(`bridgeip: ${bridgeip} light: ${light} payload: ${JSON.stringify(payload)}`)

    // Post message
    gstate.xapi.command(
        'HttpClient Put',
        {
            Header: ["Content-Type: application/json"],
            Url: `http://${bridgeip}/api/${username}/lights/${light}/state`
        },
        JSON.stringify(payload))
        .then((response) => {
            if (response.StatusCode == 200) {
                console.debug("message pushed to bridge")
                if (cb) cb(null, response.StatusCode)
                return
            }

            console.warn("updateLight: request failed with status code: " + response.StatusCode)
            if (cb) cb("failed with status code: " + response.StatusCode, response.StatusCode)
        })
        .catch((err) => {
            console.error("updateLight: failed with err: " + err.message)
            if (cb) cb("Could not contact the bridge")
        })
}


function fireAction(event) {
    console.debug(`new UserInterface event`);

    // switch (widgetId) {
    //     // Recipients panel
    //     case "update_email":
    //         updateEmail();
    //         return;
    //     case "reset_email":
    //         resetEmail();
    //         return;

    //     // Notify panel
    //     case "send_where_are_you":
    //         sendNotification("Where are you?");
    //         return;

    //     case "send_meeting_canceled":
    //         sendNotification("FYI, meeting cancelled");
    //         return;

    //     case "send_what_about_coffee":
    //         sendNotification("What about coffee!");
    //         return;

    //     default:
    //         console.debug("unknown action");
    //         return;
    // }
}

// Initialie the 'OnAir' Panel has been updated
function layoutUpdated(event) {
    console.debug(`layout update: ${event}`)

    // [TODO] Add an Halwake Message that 'OnAir' is present
}

// Startup 
console.info(`starting OnAir In-Room control, v${gstate.version}`);

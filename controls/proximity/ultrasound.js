//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License
//

/**
 * Macro companion to the Ultrasound Control
 * - lets users toggle Proximity Mode to On/Off
 * - displays the current MaxVolume level
 */

const xapi = require('xapi')


// Change proximity mode to "On" or "Off"
function switchProximityMode(mode) {
    console.debug(`switching proximity mode to: ${mode}`)

    xapi.config.set('Proximity Mode', mode)
        .then(() => {
            console.info(`turned proximity mode: ${mode}`)
        })
        .catch((err) => {
            console.error(`could not turn proximity mode: ${mode}`)
        })
}

// React to UI events
function onGui(event) {
    // Proximity Mode Switch
    if ((event.Type == 'changed') && (event.WidgetId == 'proximity_switch')) {
        switchProximityMode(event.Value)
        return;
    }
}
xapi.event.on('UserInterface Extensions Widget Action', onGui);


//
// Proximity Services Availability
//

// Update Toogle if proximity mode changes
function updateProximityToggle(mode) {
    console.debug(`switching toggle to ${mode}`)

    xapi.command("UserInterface Extensions Widget SetValue", {
        WidgetId: "proximity_switch",
        Value: mode
    })
}
xapi.config.on("Proximity Mode", mode => {
    console.log(`proximity mode changed to: ${mode}`)

    // Update toggle
    // [WORKAROUND] Configuration is On or Off, needs to be turned to lowercase
    updateProximityToggle(mode.toLowerCase())
})

// Refresh Toggle state
function refreshProximityToggle() {
    xapi.status.get("Proximity Services Availability")
        .then(availability => {
            console.debug(`current proximity mode is ${availability}`)
            switch (availability) {
                case 'Available':
                    updateProximityToggle('on')
                    return;

                case 'Disabled':
                default:
                    updateProximityToggle('off')
                    return;
            }
        })
        .catch((err) => {
            console.error(`could not read current proximity mode, err: ${err.message}`)
        })
}

//
// Audio Ultrasound MaxVolume
//
function updateUltrasoundMaxVolume(volume) {
    console.debug(`updating Ultrasound text to: ${volume}`)

    xapi.command("UserInterface Extensions Widget SetValue", {
        WidgetId: "ultrasound_maxvolume",
        Value: volume
    })
}
xapi.config.on("Audio Ultrasound MaxVolume", volume => {
    console.log(`Ultrasound maxVolume changed to: ${volume}`)

    // Update toggle
    // [WORKAROUND] Configuration is On or Off, needs to be turned to lowercase
    updateUltrasoundMaxVolume(volume)
})

function refreshUltrasoundMaxVolume() {
    xapi.config.get("Audio Ultrasound MaxVolume")
        .then(volume => updateUltrasoundMaxVolume(volume))
}


//
// Reset UI
//

// Initialize at macro startup
function refreshUserInterface() {
    refreshProximityToggle()
    refreshUltrasoundMaxVolume()
}
refreshUserInterface()

// Initialize at widget deployment
xapi.event.on('UserInterface Extensions Widget LayoutUpdated', (event) => {
    console.debug("layout updated, let's refresh our toogle")
    refreshUserInterface()
});

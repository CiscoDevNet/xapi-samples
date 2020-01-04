//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License
//


const xapi = require('xapi')

xapi.on('ready', init)


// CE maximum volume for Ultrasound 
// note: Since CE 9.9, max is 70 across all devices
//const MAX = 90 // for a DX80
//const MAX = 70 // for a RoomKit
const MAX = 70

function init() {
    console.log("connexion successful")

    // Initialize the widgets
    xapi.config.get('Audio Ultrasound MaxVolume')
        .then(updateUI)

    // Update configuration from UI actions
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {
        if (event.WidgetId !== 'US_volume_slider') return
        if (event.Type !== 'released') return

        // Update Ultrasound configuration
        const volume = Math.round(parseInt(event.Value) * MAX / 255)
        console.log(`updating Ultrasound configuration to: ${volume}`)
        xapi.config.set('Audio Ultrasound MaxVolume', volume)
    })

    // Update UI from configuration changes
    xapi.config.on('Audio Ultrasound MaxVolume', updateUI)

    // Update if the controls is (re-)deployed
    xapi.event.on('UserInterface Extensions Widget LayoutUpdated', (event) => {
        console.log(`layout updated, let's refresh the widgets`)
        xapi.config.get('Audio Ultrasound MaxVolume')
            .then(updateUI)
    })
}


function updateUI(volume) {
    console.log(`updating UI to new Ultrasound configuration: ${volume}`)

    // Update Widget: slider
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'US_volume_text',
        Value: volume
    })
        .catch((error) => {
            console.log("cannot update UI component 'Volume level'. Is the panel deployed?")
            return
        })

    // Update Widget: slider
    let newVolume = parseInt(volume)
    const level = Math.round(newVolume * 255 / MAX)
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'US_volume_slider',
        Value: level
    })
        .catch((error) => {
            console.log("cannot update UI component 'Volume slider'. Is the panel deployed?")
            return
        })

    // Update "Pairing" Invite on the Monitor
    updatePairingInvite(newVolume)
}

function updatePairingInvite(volume) {

    const MIN_LEVEL_TO_PAIR = 5 // note that this is an arbitrary value
    if (volume < MIN_LEVEL_TO_PAIR) {
        xapi.config.set('UserInterface CustomMessage', "/!\\ Pairing is disabled")
        return
    }

    // Pick the message that suits your device's registration mode
    xapi.status.get('Webex Status')
        .then((status) => {
            // If cloud-registered
            if (status == 'Registered') {
                xapi.config.set('UserInterface CustomMessage', "Tip: Launch Webex Teams to pair")
            }
            else {
                // If registered on-premises (VCS or CUCM )
                xapi.config.set('UserInterface CustomMessage', "Tip: Pair from a Proximity client")
            }
        })
}

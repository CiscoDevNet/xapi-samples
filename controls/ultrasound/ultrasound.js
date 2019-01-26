//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License
//


// Max Ultrasound Volume
const MAX = 90 // for a DX80
//const MAX = 70 // for a RoomKit

const xapi = require('xapi')

xapi.on('ready', () => {
    console.log("connexion successful")

    // Initialize the widgets
    xapi.config.get('Audio Ultrasound MaxVolume')
        .then(updateUI)

    // Update configuration from UI actions
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {
        if (event.WidgetId !== 'volume_slider') return
        if (event.Type !== 'released') return

        // Update Ultrasound configuration
        const volume = Math.round(parseInt(event.Value) * MAX / 255);
        console.log(`updating Ultrasound configuration to: ${volume}`)
        xapi.config.set('Audio Ultrasound MaxVolume', volume)
    })

    // Update UI from configuration changes
    xapi.config.on('Audio Ultrasound MaxVolume', updateUI)

    // Initialize the widgets also as the controls are deployed
    xapi.event.on('UserInterface Extensions Widget LayoutUpdated', (event) => {
        console.log(`layout updated, let's refresh the widgets`)
        xapi.config.get('Audio Ultrasound MaxVolume')
            .then(updateUI)
    });
})


function updateUI(volume) {
    console.log(`updating UI to new Ultrasound configuration: ${volume}`)

    // Update text
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'volume_text',
        Value: volume
    })
        .then(() => {
            // Update custom message
            let newVolume = parseInt(volume)
            if (newVolume <= 5) {
                xapi.config.set('UserInterface CustomMessage', "/!\\ Pairing is disabled")
                return
            }

            // Pick the message that suits your device's registration mode
            // If spark-registered
            xapi.config.set('UserInterface CustomMessage', "Tip: Launch Webex Teams to pair")
            // If VCS or CUCM registered
            //xapi.config.set('UserInterface CustomMessage', "Tip: pair with me from a Proximity client")
        })

    // Update slider 
    const level = Math.round(parseInt(volume) * 255 / MAX)
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'volume_slider',
        Value: level
    })
}

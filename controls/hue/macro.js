const xapi = require('xapi')


// Update for your Hue deployment
const BRIDGE_IP = '192.168.1.33'
const BRIDGE_USER = 'SECRET'
const LIGHT_ID = 1 // number of your Bulb as registered at your Hue Bridge


//
// Interact with Hue Lights
//

const COLOR_RED = 65535
const COLOR_BLUE = 46920
const COLOR_GREEN = 25500

function changeColorForLight(light, color) {
  console.debug(`changeColor: ${color} ForLight: ${light}`)
  updateLight(BRIDGE_IP, BRIDGE_USER, light, { "hue": color }, console.log)
}

function toggleLight(light, bool) {
  console.debug(`toggleLight: ${light} to: ${bool}`)
  updateLight(BRIDGE_IP, BRIDGE_USER, light, { "on": bool }, console.log)
}

function updateLight(bridgeip, username, light, payload, cb) {
  console.debug('updateLight: pushing payload')
  console.debug(`bridgeip: ${bridgeip} light: ${light} payload: ${JSON.stringify(payload)}`)

  // Post message
  xapi.command(
    'HttpClient Put',
    {
      Header: ["Content-Type: application/json"],
      Url: `http://${bridgeip}/api/${username}/lights/${light}/state`
    },
    JSON.stringify(payload))
    .then((response) => {
      if (response.StatusCode == 200) {
        console.log("message pushed to bridge")
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


// Listen to In-Room control events
xapi.event.on('UserInterface Extensions Widget Action', (action) => {
  console.log(`new event from group: ${action.WidgetId}`)

  // Toggle (on/off)
  if ((action.WidgetId === 'toggle') && (action.Type === 'changed')) {
    console.info(`toggling light to: ${action.Value}`)
    
    // [WORKAROUND] Switch Light and UI to Red as we cannot read from the macro
    changeColorForLight(LIGHT_ID, COLOR_RED)
    xapi.command('UserInterface Extensions Widget SetValue', {
      WidgetId: 'color_group',
      Value: 'color_red'
    })
  
    // Switch on
    toggleLight(LIGHT_ID, (action.Value === 'on'))
    return
  }

  // Color
  if (action.WidgetId === 'color_group') {
    console.info(`color change requested by: ${action.Value}`)
    switch (action.Value) {
      case 'color_red':
        changeColorForLight(LIGHT_ID, COLOR_RED)
        break
      case 'color_blue':
        changeColorForLight(LIGHT_ID, COLOR_BLUE)
        break
      case 'color_green':
        changeColorForLight(LIGHT_ID, COLOR_GREEN)
        break
      default:
        console.log(`WARNING: unsupported color change request: suspected wrong widget id: ${action.Value}`)
        break
    }
    return
  }
})

// Init at launch
xapi.event.on('UserInterface Extensions Panel Clicked PanelId', (panel) => {
  console.debug(`new panel opened group: ${panel}`)

  // Toggle (on/off)
  if (panel === 'Hue') {
    console.log(`resetting panel: turning off, and color to red`)
    
    // update lights
    changeColorForLight(LIGHT_ID, COLOR_RED)
    toggleLight(LIGHT_ID, false)
    
    // update UI
    xapi.command('UserInterface Extensions Widget SetValue', {
      WidgetId: 'color_group',
      Value: 'color_red'
    })
    xapi.command('UserInterface Extensions Widget SetValue', {
      WidgetId: 'toggle',
      Value: 'Off'
    })

    return
  }
})


console.info('Philips Hue macro listening...')

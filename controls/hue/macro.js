const xapi = require('xapi')


// Listen to In-Room control events
xapi.event.on('UserInterface Extensions Widget Action', (action) => {
  console.log(`new event from group: ${action.WidgetId}`)

  // Toggle
  if ((action.WidgetId === 'switch') && (action.Type === 'changed')) {
    toggleLight((action.Value === 'on'))
    return
  }

  // Color
  if (action.WidgetId === 'color_group') {
    switch (action.Value) {
      case 'color_red':
        changeColorForLight(4, 65535)
        break
      case 'color_blue':
        changeColorForLight(4, 46920)
        break
      case 'color_green':
        changeColorForLight(4, 25500)
        break
      default:
        changeColorForLight(4, 0)
        break
    }

    return
  }
})

//
// Interact with Hue Lights
//

// Update with your Hue Deployment
const BRIDGE_IP = '192.168.1.33'
const BRIDGE_USER = 'SECRET'

function changeColorForLight(light, color) {
  updateLight(BRIDGE_IP, BRIDGE_USER, light, { "hue": color }, console.log)
}

function toggleLight(light, bool) {
  updateLight(BRIDGE_IP, BRIDGE_USER, light, { "on": bool }, console.log)
}

function updateLight(bridgeip, username, light, payload, cb) {

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

      console.log("failed with status code: " + response.StatusCode)
      if (cb) cb("failed with status code: " + response.StatusCode, response.StatusCode)
    })
    .catch((err) => {
      console.log("failed with err: " + err.message)
      if (cb) cb("Could not contact the bridge")
    })
}

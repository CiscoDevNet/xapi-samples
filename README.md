# Handy samples for xAPI UI Extensions and Macros [![published](https://static.production.devnetcloud.com/codeexchange/assets/images/devnet-published.svg)](https://developer.cisco.com/codeexchange/github/repo/CiscoDevNet/xapi-samples)

This repo can get you quickly ramp up with CE programmability and xAPI, with examples for:
- [UI Extensions](./controls), 
- [JavaScript Macros](./macros), 
- [Node.js applications](./jsxapi), 
- [Python applications](./pyxows) 

**New to xAPI UI Extensions and Macros?**
- check the [QuickStart Guide](./docs/QuickStart.md) to learn to load Controls and Macros to your device, 
- take a DevNet Tutorial from the xAPI track (intro to xAPI and creating custom UI Extensions)

**Don't have a CE device at hand to mess up with?**
- reserve a [DevNet sandbox](https://github.com/CiscoDevNet/awesome-xapi/#sandboxes) equiped with CE latest

**Going Futher**
Once you're done browsing the examples in this repo, here are a few suggestions
- check the [official Macro Samples repository](https://github.com/CiscoDevNet/roomdevices-macros-samples)
- load the [Postman collection for xAPI](https://github.com/CiscoDevNet/postman-xapi) to invoke the xAPI from code external to the Room Device
- read through the full [CE Customization PDF Guide](https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/ce99/collaboration-endpoint-software-api-reference-guide-ce99.pdf)
- check for the curated list of resources at [awesome-xapi](https://github.com/CiscoDevNet/awesome-xapi)


## T-Shell Tips for developers

Simply SSH to your Collaboration Device and run the commands below:

### Listen to events

The 'xfeedback' commands let you see all events fired on your device.
This is very useful to investigate possibilities, and take shortcut without going through the whole documentation at times.

```shell
# Listen to all notifications (events, status, commands)
xfeedback register /
```

```shell
# Listen to UI Extensions events
xfeedback register /Event/UserInterface/Extensions
```

```shell
# Stop listening
xfeedback deregisterall
```

### Send messages

Sending messages lets you craft custom APIs, by coming up with your own protocols, aka, Event Driven Architectures.
One code will send a serialized message, the other code will capture the message and decode it.

```shell
# Listen to messages
xfeedback register /Event/Message/Send
```

```shell
# Send message
xCommand Message Send Text: "This is random text"
```

Check the [message Macro](macros/8-message.js) for an example in JavaScript.
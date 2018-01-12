# Handy samples for xAPI In-Room Controls & Macros

This repo contains [Controls](./controls) and [Javascript Macros](./macros) examples to quickly ramp you up with the CE programmability and xAPI. 

**New to Controls & Macros? check the [QuickStart Guide](./QuickStart.md) to learn to load Controls and Macros to your device**

Next steps: done with the examples in this repo? here are a few suggestions
- check the [official Macro Samples repository](https://github.com/CiscoDevNet/roomdevices-macros-samples)
- load the [Postman collection for xAPI](https://github.com/CiscoDevNet/postman-xapi) to invoke the xAPI from code external to the Room Device
- open the full [CE Customization PDF Guide](https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/ce92/sx-mx-dx-room-kit-customization-guide-ce92.pdf)
- experiment T-shell commands with the sample below.


## Quick intro to T-Shell

Simply SSH to your Collaboration Device and run the commands below:

**Listening to events**


```shell
# Listen to all notifications (events, status, commands)
xfeedback register /
```

```shell
# Listen to in-room control events
xfeedback register /Event/UserInterface/Extensions
```

```shell
# Stop listening
xfeedback deregisterall
```


**Sending messages**

```shell
# Listen to messages
xfeedback register /Event/Message/Send
```

```shell
# Send message
xCommand Message Send Text: "This is random text"
```

Check the [message Macro](macros/8-message.js) for an example in javascript.
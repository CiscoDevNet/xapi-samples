# Handy samples for xAPI In-Room Controls & Macros

This repo regroups [macros](./macros) and [controls](./controls) examples, plus handy commands when coding against the xAPI.


## Listening to events

Simply SSH to your Collaboration Device and run the commands below in a TSH (t-shell).

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


## Sending messages

```shell
# Listen to messages
xfeedback register /Event/Message/Send
```

```shell
# Send message
xCommand Message Send Text: "This is random text"
```

Check the [message Macro](macros/8-message.js) for an example in javascript.
# Handy samples for xAPI In-Room Controls & Macros

This repo regroups a set of macros and controls, check the related folder.

Hereafter I present the commands I happen to often use when coding against the xAPI.
Simply SSH to your Collaboration Device and start a TSH (t-shell) to run these commands.

## Listen to events

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
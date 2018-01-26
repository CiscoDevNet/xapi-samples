# Example scripts using the Node.js jsxapi for Cisco Collaboration Devices

The [Node.js jsxapi](https://github.com/cisco-ce/jsxapi) lets you create applications that interact with Cisco Collaboration Devices (DX, SX, MX, RoomKit, any CE-powered in fact).

You'll find here scripts to learn the jsxapi through baby steps.

**New to Room Devices, Controls & Macros? check the [QuickStart Guide](../docs/QuickStart.md) to learn to connect to your Device's Web Interface, and load Controls & Macros to your device**

## Quickstart

Open a terminal and run the commands below:

```shell
git clone https://github.com/ObjectIsAdvantag/xapi-samples
cd xapi-samples
cd jsxapi
npm install

# Place your device ip-address and credentials
JSXAPI_DEVICE_URL='ssh://10.10.1.10' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node 8-rolling-messages
```

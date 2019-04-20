# OnAir - CanIBugDad?

an In-Room Control that toogles a Hue bulb color, depending on the room's state: free, occupied, busy, on air (call in progress)

![](img/onair_busy.png)



## Quickstart 

Deploy the [control](./onair.xml) to your device

Open the file `script.js` if you're planning to run/test/debug, or the `macro.js` if ready to deploy as a Macro.

Update wih your Philipps Hue deployment settings.

Example to run as the script from a shell terminal:

```shell
git clone https://github.com/ObjectIsAdvantag/xapi-samples
cd controls
cd onair
npm install
JSXAPI_DEVICE_URL='ssh://192.168.1.32' JSXAPI_USERNAME='localadmin' JSXAPI_PASSWORD='ciscopsdt' node script.js
```

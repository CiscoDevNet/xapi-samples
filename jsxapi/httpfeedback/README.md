# Service to follow people count metrics in real time

Start an HTTP Server that registers as a Webhook to your Room Device (via xAPI 's HttpFeedback)

Open a terminal and run the commands as described below: 

```shell
git clone <repo>
cd <repo>
cd jsxapi
cd httpfeedback
npm install

JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='admin' JSXAPI_PASSWORD='' WEBHOOK_URL="http://192.168.1.34:8080" node server.js
```

Check the service is running by hitting its healthcheck at http://localhost:8080 and http://192.168.1.34:8080 in the example above.

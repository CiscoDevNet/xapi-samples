# Service to follow people count metrics in real time

Open a terminal and run the commands as described below: 

```shell
git clone <repo>
cd <repo>
cd jsxapi
cd httpfeedback
npm install

JSXAPI_DEVICE_URL='ssh://10.10.1.10' JSXAPI_USERNAME='admin' JSXAPI_PASSWORD='' WEBHOOK_URL="http://10.10.1.11:8080" node server.js
```

Check the service is running by hitting its healthcheck at http://localhost:8080 and http://10.10.1.11:8080 in the example above.

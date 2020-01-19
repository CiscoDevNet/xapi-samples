# xAPI from Web pages

To invoke xAPI from an HTML page, you first need to generate a packaged distribution for the jsxapi.

From a bash terminal, run the commands below to generate a `jsxapi.min.js` file:

```shell
git clone https://github.com/cisco-ce/jsxapi
cd jsxapi
npm run build:dist:min
cd dist
```


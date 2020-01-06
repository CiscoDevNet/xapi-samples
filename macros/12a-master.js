//
// Copyright (c) 2019 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Pushes an event to a remote Codec using the Message command and an HttpClient POST
 * This code needs a listener: install the slave.js macro on the remote Codec
 * 
 */

const xapi = require('xapi');

const SLAVE_IP = "192.168.1.32";
const SLAVE_BASICAUTH = "bG9jYWxhZG1pbjpjaXNjb3BzZHQ=";

var EVENTURL = `http://${SLAVE_IP}/putxml`;
var HEADERS = ['Content-Type: text/xml', `Authorization: Basic ${SLAVE_BASICAUTH}`];

function postRequest(url, payload, headers) {
   xapi.command('HttpClient Post', {
      Url: url,
      Header: headers
   }, payload).then((response) => { console.log(JSON.stringify(response)) });
   console.log(payload);
}

function sendEvent(event) {
   event = event.replace(/"/g, "\'");
   var payload = "<XmlDoc internal='True'><Command><Message><Send><Text>" + event + "</Text></Send></Message></Command></XmlDoc>";
   postRequest(EVENTURL, payload, HEADERS);
}

function volumeSync(volume) {
   sendEvent(JSON.stringify({ "Audio Volume Set": { "Level": volume } }));
}

xapi.status.on('Audio Volume', volumeSync);

console.log('master started')
const xapi = require('xapi');

xapi.status
    .get('Audio Volume')
    .then((volume) => { console.log(volume); })
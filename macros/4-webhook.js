/**
 * Sends HTTP payload everytime People Analytics are pushed
 */
const xapi = require('xapi');

xapi.command('HttpFeedback Register', {
   FeedbackSlot: 2,
   ServerUrl: "https://requestb.in/szua2usz",
   Format: "JSON",
   Expression: ["/Status/RoomAnalytics/PeoplePresence", "/Status/RoomAnalytics/PeopleCount"]
})
   .then(console.log("successfully registered Webhook for PeoplePresence & PeopleCount"))
   .catch(console.error);
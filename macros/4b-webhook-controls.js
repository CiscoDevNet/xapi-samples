const xapi = require('xapi');

xapi.command('HttpFeedback Register', {
   FeedbackSlot: 2,
   ServerUrl: "https://requestb.in/156r6651",
   Format: "JSON",
   Expression: ["/Event/UserInterface/Extensions/Widget/Action"]
})
   .then(console.log("successfully registered Webhook for In-Room controls"))
   .catch(console.error);

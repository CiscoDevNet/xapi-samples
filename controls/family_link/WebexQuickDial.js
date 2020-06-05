//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

const xapi = require('xapi');

// Set this is you don't want to prompt users for a PIN
let hostpin = '1234';
// This is what every widget on the UI should have as a prefix for us to make a webex call
const MATCH_STRING = 'wqd-';

const DIALPREFIX_WEBEXURL = 'icu';
const DIALPREPOSTFIX_WEBEXURL = '.sswhg-cv19';
const DIALPOSTFIX_WEBEXURL = '@webex.com';

const KEYBOARD_TYPES = {
      NUMERIC     :   'Numeric'
    , SINGLELINE  :   'SingleLine'
    , PASSWORD    :   'Password'
    , PIN         :   'PIN'
}
const CALL_TYPES = {
      AUDIO     :   'Audio'
    , VIDEO     :   'Video'
}

const DIALPAD_ID = 'webexdialpad';
const DIALHOSTPIN_ID = 'webexhostpin';

const INROOMCONTROL_WEBEXCONTROL_PANELID = 'webexdialler';
const INROOMCONTROL_WEBEXQUICKDIAL_PANELID = 'webexquickdial';

/* Use these to check that its a valid number (depending on what you want to allow users to call */
const REGEXP_URLDIALER = /([a-zA-Z0-9@_\-\.]+)/; /*  . Use this one if you want to allow URL dialling */
const REGEXP_NUMERICDIALER =  /^([0-9]{1,2})$/; /* Use this one if you want to limit calls to numeric only. In this example, require number to be between 3 and 10 digits. */

let webexnumbertodial = '';
let isInWebexCall = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

xapi.event.on('CallDisconnect', (event) => {
	isInWebexCall = 0;
});
    
function showDialPad(text){
 xapi.command("UserInterface Message TextInput Display", {
       InputType: KEYBOARD_TYPES.NUMERIC
     , Placeholder: '1 or 2-digit room number'
     , Title: "Webex Call"
     , Text: text
     , SubmitText: "Next" 
     , FeedbackId: DIALPAD_ID
 }).catch((error) => { console.error(error); });
}

/* This is the listener for the in-room control panel button that will trigger the dial panel to appear */
xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
    if (event.PanelId === INROOMCONTROL_WEBEXCONTROL_PANELID){
         showDialPad("Enter the 1 or 2-digit room number:" );
    }
});

xapi.event.on('UserInterface Extensions Widget Action', (event) => {
  if (event.WidgetId.search(MATCH_STRING) !== -1) {
    webexnumbertodial = event.WidgetId.replace("wqd-", "")
    console.log(webexnumbertodial);
    webexnumbertodial = webexnumbertodial + DIALPREPOSTFIX_WEBEXURL + DIALPOSTFIX_WEBEXURL ;
    xapi.command("dial", {Number: webexnumbertodial}).catch((error) => { console.error(error); });
  }
});

xapi.event.on('UserInterface Message TextInput Response', (event) => {
  switch(event.FeedbackId) {
    case DIALPAD_ID:
      let regex = REGEXP_NUMERICDIALER; // First check, is it a valid number to dial
      let match = regex.exec(event.Text);    
      if (match !== null) {
        let contains_at_regex = /@/;    
        let contains_at_in_dialstring = contains_at_regex.exec(event.Text);
        if (contains_at_in_dialstring !== null) {
          webexnumbertodial = match[1];
        } else {
          webexnumbertodial = match[1];
          webexnumbertodial = DIALPREFIX_WEBEXURL + webexnumbertodial + DIALPREPOSTFIX_WEBEXURL + DIALPOSTFIX_WEBEXURL ; // Here we add the default hostname to the SIP number 
        }
        if (hostpin === '') {
        sleep(200).then(() => { //this is a necessary trick to get it working with multiple touch panels to not mess up event-clears from other panels
          xapi.command("UserInterface Message TextInput Display", {
             InputType: KEYBOARD_TYPES.NUMERIC
           , Placeholder: "Hostpin (optional)" 
           , Title: "Enter Host pin or leave blank"
           , Text: 'Webex call number:' + webexnumbertodial
           , SubmitText: "Dial" 
           , FeedbackId: DIALHOSTPIN_ID
          }).catch((error) => { console.error(error); });                
        });
        } else {
          xapi.command("dial", {Number: webexnumbertodial}).catch((error) => { console.error(error); });
        }
      } else {
        showDialPad("You typed in an invalid number. Enter a 1 or 2-digit number." );
      }
    break;

    case DIALHOSTPIN_ID:
      hostpin = event.Text;
      xapi.command("dial", {Number: webexnumbertodial}).catch((error) => { console.error(error); });
    break;
  }
});

xapi.status.on('Conference Call', (callInfo) => {
  if (callInfo.AuthenticationRequest === 'HostPinOrGuest') {
    isInWebexCall = 1;
    console.log(callInfo);
    xapi.command('Conference Call AuthenticationResponse', {
      CallId: callInfo.id,
      ParticipantRole: 'Host',
      Pin: hostpin + '#',
    });
  }
});
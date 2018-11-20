//
// Copyright (c) 2018 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Listen to User Interfaace control events via xAPI's feedback function
 * Pushes events to a Webex Teams space via a Bot Account
 * !!!Place your Bot token below!!!
 */

//
// Connect to the device
//

const jsxapi = require('jsxapi');

// Check args
if (!process.env.JSXAPI_DEVICE_URL || !process.env.JSXAPI_USERNAME) {
    console.error("Please specify info to connect to your device as JSXAPI_DEVICE_URL, JSXAPI_USERNAME, JSXAPI_PASSWORD env variables");
    console.error("Bash example: JSXAPI_DEVICE_URL='ssh://192.168.1.34' JSXAPI_USERNAME='integrator' JSXAPI_PASSWORD='integrator' node agenda.js");
    process.exit(1);
}

// Empty passwords are supported
const password = process.env.JSXAPI_PASSWORD ? process.env.JSXAPI_PASSWORD : "";

// Connect to the device
console.log("connecting to your device...");
const xapi = jsxapi.connect(process.env.JSXAPI_DEVICE_URL, {
    username: process.env.JSXAPI_USERNAME,
    password: password
});
xapi.on('error', (err) => {
    switch (err) {
        case "client-socket":
            console.error("could not connect: invalid URL.");
            break;

        case "client-authentication":
            console.error("could not connect: invalid credentials.");
            break;

        case "client-timeout":
            console.error("could not connect: timeout.");
            break;

        default:
            console.error(`encountered error: ${err}.`);
            break;
    }

    console.log("exiting...");
    process.exit(1);
});

xapi.on('ready', () => {
    console.log("connexion successful");

    // Begin main code logic
    main();
});


//
// Code logic
//

function main() {
    // Listen to custom In-Room Controls events
    console.log("added feedback event listener: UserInterface Extensions Event Clicked");
    xapi.event.on('UserInterface Extensions Event Clicked', (event) => {
        console.log(`new event from: ${event.Signal}`);

        // Identify session associated to button
        let sessionId = extractSession(event.Signal);
        if (!sessionId) {
            console.log("bad format, ignoring...");
            return;
        }

        // Fetch session details
        let session = sessions[sessionId];
        if (!session) {
            console.log("could not find details for session, ignoring...");
            return;
        }

        // Push info about the session
        push(`${session.day}, ${session.time}: **${session.title}** in ${session.location}<br/>_${session.description}_`);
    });
}


function extractSession(component) {
    //let parsed = component.match(/^push_(DEVNET-\d{4}[A:B]?)$/);
    let parsed = component.match(/^push_(.*)$/);

    if (!parsed) {
        console.log("format error, please comply with 'push_DEVNET-DDDD'");
        return undefined;
    }

    return parsed[1];
}

//
// Post message to a Webex Teams space via a Bot
//

// Replace with your bot token
const token = "NGQ4YzkxOTgtZDc0Yy00NTQ4LTkyODEtOGYzNTFiN2FkZmRiOTgwNzgwMTAtM2E4"
// replace with a space your bot is part of
const roomId = "Y2lzY29zcGFyazovL3VzL1JPT00vMTQ0YTc0NTAtZWM1MS0xMWU4LWExZDAtYWRlYjI4NDZjZmI1"

function push(msg, cb) {

    // Post message
    let payload = {
        "markdown": msg,
        "roomId": roomId
    }
    xapi.command(
        'HttpClient Post',
        {
            Header: ["Content-Type: application/json", "Authorization: Bearer " + token],
            Url: "https://api.ciscospark.com/v1/messages",
            AllowInsecureHTTPS: "True"
        },
        JSON.stringify(payload))
        .then((response) => {
            if (response.StatusCode == 200) {
                console.log("message pushed to Webex Teams");
                if (cb) cb(null);
                return;
            }
        })
        .catch((err) => {
            console.log("failed: " + err.message)
            if (cb) cb("Could not post message to Webex Teams")
        })
}


//
// List of sessions
//

const sessions = {};
sessions["steve"] = {
    id: "push_steve",
    title: "KeyNote - When apps meet infrastructure",
    description: "Are there days when you wake up and tell yourself: 'it's too bad, I wish I was born a decade or two earlier, there was so much to create then'? Well, at DevNet, we think you are lucky and in the exactly right decade! I joined DevNet - Cisco's Developer Program - a couple of years ago, looking forward to explore how applications could better leverage the pieces of infrastructure laying here and there. I'll share some use cases I discovered while building prototypes and supporting hackathons, in the hope of inspiring you for your next startup or simply learn and have fun on the way.",
    location: "Room 1",
    type: "keynote",
    day: "Thursday",
    time: "09:30AM",
    duration: "15",
    speaker: "Stève Sfartz",
    href: "https://milan2018.codemotionworld.com/wp-content/themes/event/detail-talk.php?detail=10652"
}

sessions["matt"] = {
    id: "push_matt",
    title: "My developer journey towards true hybrid cloud with Kubernetes",
    description: "We started in an automation nightmare, proprietary cloud API's everywhere and awful on-premise user experience; The foundations for hybrid were quicksand! Now, we live in a world of Kubernetes; Consistent APIs for workloads, better solutions for on-prem infrastructure, and service brokers which abstract service management. Better foundations! The building has stopped shaking, build some stairs! Where are we on realising this hybrid vision? One guys take on where we are, based on success and failure towards 'true hybrid cloud'. What works, what doesn't, and lots of 'why isn't this a thing yet?'",
    location: "Room 6",
    type: "technical talk",
    day: "Thursday",
    time: "11:30AM",
    duration: "40",
    speaker: "Matt Johnson",
    href: "https://milan2018.codemotionworld.com/wp-content/themes/event/detail-talk.php?detail=10712"
}

sessions["roger"] = {
    id: "push_roger",
    title: "Making Enterprise Virtual Reality a Practical Reality",
    description: "Virtual Reality is set to be one of the most disruptive technologies. Whether you work in Gaming, Construction, Financial Services or even for a Formula1 team, chances are you will be working with VR in the very near future. But current VR architectures are not practical for the Enterprise. So how do you go about building an Enterprise VR platform? How do you deliver solutions like Nvidia Holodeck, integrate with Google Hangouts, leverage infrastructure as code for a consistent user experience? In the session, you’ll get a glimpse at the VR Platform Cisco is building with our partner eBB3",
    location: "Room 6",
    type: "technical talk",
    day: "Thursday",
    time: "12:30PM",
    duration: "40",
    speaker: "Roger Dickinson",
    href: "https://milan2018.codemotionworld.com/wp-content/themes/event/detail-talk.php?detail=10457"

}

sessions["cory"] = {
    id: "push_cory",
    title: "API Magic and Applications on the Network [Cory Guynn]",
    description: "Is your app smart? Can it adjust to network conditions so it’s more efficient, useful and optimized? With the advent of software defined networking, you now have the opportunity to take advantage of the network as an application platform. With the Cisco Meraki, you can improve the efficiency and effectiveness of your app as it pertains to the network it is running on. In this session, we’ll show you how your app can take advantage of indoor WiFi and Bluetooth tracking, offer customizable portals, handle network platform webhooks that give real-time updates, and see into and adjust the network.",
    location: "Room 6",
    type: "technical talk",
    day: "Thursday",
    time: "2:10PM",
    duration: "4O",
    speaker: "Cory Guynn",
    href: "https://milan2018.codemotionworld.com/wp-content/themes/event/detail-talk.php?detail=10454"
}

sessions["challenge"] = {
    id: "push_challenge",
    title: "Grab the Bag Challenge & Demos",
    description: "...",
    location: "Cisco Booth",
    type: "activity",
    day: "Thursday/Friday",
    time: "Till 4:00PM",
    duration: "300",
    speaker: "Janel Kratky",
    href: "https://milan2018.codemotionworld.com/wp-content/themes/event/detail-talk.php?detail=10712"
}

sessions["labs"] = {
    id: "push_labs",
    title: "Discover Kubernetes, Meraki and Webex Devices",
    description: "Join this terrific experience together with the latest technologies: experiment with fun and enjoy the thrill of new coding solutions, being involved with Cisco!",
    location: "Hands-On Labs",
    type: "activity",
    day: "Thursday",
    time: "11:30AM",
    duration: "360",
    speaker: "Paola Mancini, Amandine Dubillon",
    href: "https://milan2018.codemotionworld.com/schedule/cisco-hands-on/"
}

sessions["demos"] = {
    id: "push_demos",
    title: "Meet Cisco DevNet: Meraki & Webex Devices Demos",
    description: "Don’t miss our DevNet booth where we will demos on Cisco Meraki and Webex APIs. Come see the demos in action and ask questions to our experts.",
    location: "Cisco Booth",
    type: "activity",
    day: "Thursday/Friday",
    time: "Till 6:00PM",
    duration: "360",
    speaker: "Janel Kratky",
    href: "https://developer.cisco.com/events/codemotion18/"
}


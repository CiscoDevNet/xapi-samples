//
// Utilities: catalog of sessions
//

// List of sessions
const sessions = {};
sessions["steve"] = {
    id: "push_steve",
    title: "KeyNote - When apps meet infrastructure",
    description: "...",
    location: "Room 1",
    type: "keynote",
    day: "Thursday",
    time: "09:30AM",
    duration: "15",
    speaker: "Stève Sfartz"
}

sessions["matt"] = {
    id: "push_matt",
    title: "My developer journey towards true hybrid cloud with Kubernetes",
    description: "...",
    location: "Room 6",
    type: "technical talk",
    day: "Thursday",
    time: "11:30AM",
    duration: "40",
    speaker: "Matt Johnson"
}

sessions["roger"] = {
    id: "push_roger",
    title: "Making Enterprise Virtual Reality a Practical Reality",
    description: "...",
    location: "Room 6",
    type: "technical talk",
    day: "Thursday",
    time: "12:30PM",
    duration: "40",

}

sessions["cory"] = {
    id: "push_cory",
    title: "API Magic and Applications on the Network [Cory Guynn]",
    description: "...",
    location: "Room 6",
    type: "technical talk",
    day: "Thursday",
    time: "2:10PM",
    duration: "4O"
}

sessions["challenge"] = {
    id: "push_challenge",
    title: "Grab the Bag Challenge & Demos",
    description: "...",
    location: "Cisco Booth",
    type: "activity",
    day: "Thursday/Friday",
    time: "Till 4:00PM",
    duration: "300"
}

sessions["labs"] = {
    id: "push_labs",
    title: "Discover Kubernetes, Meraki and Webex Devices",
    description: "...",
    location: "Hands-On Labs",
    type: "activity",
    day: "Thursday",
    time: "11:30AM",
    duration: "360"
}

sessions["demos"] = {
    id: "push_demos",
    title: "Meet Cisco DevNet: Meraki & Webex Devices Demos",
    description: "...",
    location: "Cisco Booth",
    type: "activity",
    day: "Thursday/Friday",
    time: "Til 6:00PM",
    duration: "360"
}


// Export function
module.exports = function getInfo(sessionId) {
    return sessions[sessionId];
}

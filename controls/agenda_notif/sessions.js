//
// Utilities: catalog of sessions
//

// List of sessions
const sessions = {};
sessions["DEVNET-2896"] = {
    id: "DEVNET-2896",
    title: "ChatBots 101: design, code, deploy",
    description: "Join this classroom to get an overview of what it takes to leverage the Webex Teams messaging capabilities and create Enterprise Chatbots. We'll explain the Webex Teams REST API capabilities, explain how to automate Webex Teams, and dive into the details of creating and deploying securely conversational Enterprise Bots.",
    location: "Classroom 2",
    type: "classroom",
    day: "Monday",
    time: "11:30PM",
    duration: "45"
}

sessions["DEVNET-1808"] = {
    id: "DEVNET-1808",
    title: "Golang 101 for ITPros",
    description: "This session is an introduction to Golang - the Go programming language - for IT Professionals. We'll explain how to setup a GO development environment, create a simple HTTP/2 Web API, and embed our code into a Docker container. We'll also go through the reasons why the language is so popular to create network applications by showing how the language is expressive, concise, clean, and efficient. Join this session if you've started writing Python scripts that consume Web APIs, and you now want to go to the next stage by creating your own APIs to expose or store Enterprise Data.",
    location: "Classroom 2",
    type: "classroom",
    day: "Monday",
    time: "12:30PM",
    duration: "45"
}

sessions["DEVNET-2074A"] = {
    id: "DEVNET-2074",
    title: "Enhancing Meeting Rooms User Experience with xAPIs",
    description: "Join this workshop to go hands-on with CE - Cisco Collaboration Endpoint System - programmability. You'll learn to interact with a Spark-registered Collaboration device from the xAPI, and then implement an end-to-end application that will leverage the Room Analytics capability of RoomKit devices.",
    location: "Workshop 5",
    type: "workshop",
    day: "Monday",
    time: "3:30PM",
    duration: "45"
}

sessions["DEVNET-2071"] = {
    id: "DEVNET-2071",
    title: "Integrated, Automated Video Room Systems with xAPIs and Macros",
    description: "Cisco’s DX / MX / SX and Roomkit immersive telepresence room systems are highly customizable and configurable, providing multiple ways to integrate with room amenities like lighting, shades and projectors as well as provide customized user/presenter controls.  Application developers can leverage room system API capabilities to examine room utilization via people counting, but also  initiate call video. Join us for this overview and demo-rich session to learn how to enhance your meeting rooms experience with In-Room Controls, Javascript Macro and xAPI calls.",
    location: "Classroom 2",
    type: "classroom",
    day: "Tuesday",
    time: "10:30AM",
    duration: "45"
}

sessions["DEVNET-1871"] = {
    id: "DEVNET-1871",
    title: "Microservices & Serverless architecture principles applied",
    description: "Then: you've successfully implemented a few Web Services, and you're wondering how to deploy, scale, secure and monitor them. We'll explain the the 'SideCar' and 'API Gateway' patterns of microservices architectures principles, and apply these principles to the deployment of scalable and secure Chat Bots with the Caddy Server. Join this session to learn about microservices architecture patterns and implementation options (whether you're a bot builder or not !).",
    location: "Classroom 2",
    type: "classroom",
    day: "Tuesday",
    time: "2:30PM",
    duration: "45"
}

sessions["DEVNET-3071A"] = {
    id: "DEVNET-3071",
    title: "Creating conversational chatbots with Botkit",
    description: "Join this session to learn to create a conversational chatbot for Webex Teams. We will explain the Botkit framework underlying concepts, and detail the various steps to implement a conversational Bot, from designing the conversation to coding it in Javascript with the Botkit framework. We will provide laptops with a pre-configured NodeJS development environment. Pre-requisites: you have a Webex Teams account, and software development experience.",
    location: "Workshop 8",
    type: "workshop",
    day: "Tuesday",
    time: "3:30PM",
    duration: "45"
}

sessions["DEVNET-2074B"] = {
    id: "DEVNET-2074",
    title: "Enhancing Meeting Rooms User Experience with xAPIs",
    description: "Join this workshop to go hands-on with CE - Cisco Collaboration Endpoint System - programmability. You'll learn to interact with a Spark-registered Collaboration device from the xAPI, and then implement an end-to-end application that will leverage the Room Analytics capability of RoomKit devices.",
    location: "Workshop 5",
    type: "workshop",
    day: "Wednesday",
    time: "10:30AM",
    duration: "45"
}

sessions["DEVNET-3610"] = {
    id: "DEVNET-3610",
    title: "Webex Teams APIs for Admin and Serviceability",
    description: "Join to explore concrete use cases implemented with the Administrative & Serviceability capabilities of Webex Teams APIs. We'll cover how to manage users but also track spaces activity through the recently added '/events' API resource. Moreover, we will dig into the possibilities offered by the xAPI for cloud-registered devices: discover Company Branding, People counting, and how to initiate Video Calls to Webex & SIP addresses. This session is aimed at Webex Administrators, Compliance Officers, and Cisco Collaboration Endpoints owners.",
    location: "Classroom 2",
    type: "classroom",
    day: "Wednesday",
    time: "12:30PM",
    duration: "45"
}

sessions["DEVNET-3071B"] = {
    id: "DEVNET-3071",
    title: "DevNet Workshop-Creating Cisco Spark conversational bots with Botkit",
    description: "Join this session to learn to create a conversational chatbot for Webex Teams. We will explain the Botkit framework underlying concepts, and detail the various steps to implement a conversational Bot, from designing the conversation to coding it in Javascript with the Botkit framework. We will provide laptops with a pre-configured NodeJS development environment. Pre-requisites: you have a Webex Teams account, and software development experience.",
    location: "Workshop 8",
    type: "workshop",
    day: "Wednesday",
    time: "2:30PM",
    duration: "45"
}

sessions["DEVNET-3891"] = {
    id: "DEVNET-3891",
    title: "Webex Teams Widgets Technical Drill Down",
    description: "The Webex Teams React library allows developers to easily incorporate Webex functionality into an application. Throughout this session, we'll describe the architecture of the React widgets, and detail how to start from the existing opensource project on Github to create a customized version of the Widgets.",
    location: "Classroom 2",
    type: "classroom",
    day: "Wednesday",
    time: "3:30PM",
    duration: "45"
}

// Export function
module.exports = function getInfo(sessionId) {
    return sessions[sessionId];
}

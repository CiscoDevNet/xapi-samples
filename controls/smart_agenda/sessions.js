// 
const sessions = {};
sessions["DEVNET-2074"] = {
    id: "DEVNET-2074",
    title: "Enhancing Meeting Rooms User Experience with xAPIs",
    location: "Workshop 5",
    type: "workshop",
    day: "Monday",
    time: "3:30PM",
    duration: "45"
}

module.exports = function getInfo(sessionId) {
    return sessions[sessionId];
}

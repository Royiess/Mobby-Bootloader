const config = require("./config");

const services = {
    mobby: {
        name: "Mobby",
        appId: config.applicationIds.mobby,
        token: config.tokens.mobby,
        endpoint: "https://mobby.onrender.com/control"
    },

    skycord: {
        name: "Skycord",
        appId: config.applicationIds.skycord,
        token: config.tokens.skycord,
        endpoint: "https://skycord.onrender.com/control"
    }
};

module.exports = services;

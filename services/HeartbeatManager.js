const { updateServiceStatus } = require("./BotManager");

const TIMEOUT = 90000;

const heartbeats = new Map();

function registerHeartbeat(id, data) {
    heartbeats.set(id, {
        ...data,
        lastSeen: Date.now()
    });

    updateServiceStatus(id, data);
}

function cleanupDeadServices() {
    const now = Date.now();

    for (const [id, data] of heartbeats.entries()) {
        if (now - data.lastSeen > TIMEOUT) {
            heartbeats.delete(id);

            updateServiceStatus(id, {
                status: "offline",
                ping: null
            });
        }
    }
}

setInterval(cleanupDeadServices, 15000);

module.exports = {
    registerHeartbeat,
    heartbeats
};

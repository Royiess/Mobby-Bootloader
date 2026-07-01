const fs = require("fs");

const CONFIG_PATH = "./config/bots.json";

function loadConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function getServices() {
    return loadConfig().services || [];
}

function getService(id) {
    return getServices().find(s => s.id === id);
}

function updateServiceStatus(id, data) {
    const config = loadConfig();

    const service = config.services.find(s => s.id === id);
    if (!service) return false;

    service.lastHeartbeat = Date.now();
    service.status = data.status || "unknown";
    service.ping = data.ping || 0;

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));

    return true;
}

module.exports = {
    getServices,
    getService,
    updateServiceStatus
};

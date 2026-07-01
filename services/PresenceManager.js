function setPresence(client, state = "online") {

    const statusMap = {
        online: "online",
        dnd: "dnd",
        idle: "idle",
        offline: "invisible"
    };

    client.user.setPresence({
        status: statusMap[state] || "online",
        activities: [
            {
                name: "Mobby Bootloader Active"
            }
        ]
    });
}

module.exports = { setPresence };

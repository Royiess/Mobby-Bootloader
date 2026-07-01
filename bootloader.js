require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const OWNER_ID = "1101862076839886971";

/*
==========================
DISCORD CLIENT
==========================
*/

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

/*
==========================
EXPRESS (RENDER FIX)
==========================
*/

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        status: "Bootloader online",
        bot: client.user?.tag || "starting"
    });
});

app.listen(PORT, () => {
    console.log(`HTTP server running on ${PORT}`);
});

/*
==========================
STATE
==========================
*/

const services = new Map();

let maintenance = false;
let maintenanceTimeout = null;

/*
==========================
SERVICES
==========================
*/

function registerService(id, name) {
    services.set(id, {
        id,
        name,
        status: "online",
        lastUpdate: Date.now()
    });
}

registerService("mobby", "Mobby");
registerService("skycord", "Skycord");

/*
==========================
UTILS
==========================
*/

function setAll(status) {
    for (const s of services.values()) {
        s.status = status;
        s.lastUpdate = Date.now();
    }
}

function parseTime(input) {
    const match = input?.match(/^(\d+)(s|m|h|d|w|mo|y)$/);
    if (!match) return null;

    const value = Number(match[1]);
    const unit = match[2];

    const map = {
        s: 1000,
        m: 60000,
        h: 3600000,
        d: 86400000,
        w: 604800000,
        mo: 2592000000,
        y: 31536000000
    };

    return value * map[unit];
}

/*
==========================
COMMAND HANDLER
==========================
*/

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.content.startsWith("mb.")) return;

    // OWNER LOCK
    if (message.author.id !== OWNER_ID) return;

    const args = message.content.slice(3).trim().split(" ");
    const cmd = args.shift()?.toLowerCase();

    try {

        switch (cmd) {

            case "help":
                return message.reply(
`**Mobby Bootloader Commands**
mb.help
mb.status
mb.startservices
mb.stopservices
mb.mt on/off
mb.tm on <time>`
                );

            case "status": {
                let out = "**Mobby Bootloader Status**\n\n";

                for (const s of services.values()) {
                    out += `**${s.name}** → ${s.status}\n`;
                }

                out += `\nMaintenance: ${maintenance ? "ON" : "OFF"}`;

                return message.reply(out);
            }

            case "startservices":
                setAll("online");
                return message.reply("🟢 Services ONLINE");

            case "stopservices":
                setAll("offline");
                return message.reply("🔴 Services OFFLINE");

            case "mt": {
                const mode = args[0];

                if (maintenanceTimeout) {
                    clearTimeout(maintenanceTimeout);
                    maintenanceTimeout = null;
                }

                if (mode === "on") {
                    maintenance = true;
                    return message.reply("🚧 Maintenance ON");
                }

                if (mode === "off") {
                    maintenance = false;
                    return message.reply("🟢 Maintenance OFF");
                }

                return message.reply("Usage: mb.mt on/off");
            }

            case "tm": {
                if (args[0] !== "on") {
                    return message.reply("Usage: mb.tm on <time>");
                }

                const ms = parseTime(args[1]);
                if (!ms) return message.reply("Invalid time format");

                maintenance = true;

                if (maintenanceTimeout) clearTimeout(maintenanceTimeout);

                maintenanceTimeout = setTimeout(() => {
                    maintenance = false;
                    message.channel.send("🟢 Maintenance ended");
                }, ms);

                return message.reply(`🚧 Maintenance ON for ${args[1]}`);
            }

        }

    } catch (err) {
        console.error(err);
        return message.reply("❌ Error executing command");
    }

});

/*
==========================
READY
==========================
*/

client.once("clientReady", () => {
    console.log(`Bootloader online as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

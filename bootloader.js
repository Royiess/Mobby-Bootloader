require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const OWNER_ID = "1101862076839886971";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
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
REGISTER SERVICES
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
    if (!input) return null;

    const match = input.match(/^(\d+)(s|m|h|d|w|mo|y)$/);
    if (!match) return null;

    const value = Number(match[1]);
    const unit = match[2];

    const map = {
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        d: 1000 * 60 * 60 * 24,
        w: 1000 * 60 * 60 * 24 * 7,
        mo: 1000 * 60 * 60 * 24 * 30,
        y: 1000 * 60 * 60 * 24 * 365
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

    const prefix = "mb.";
    if (!message.content.startsWith(prefix)) return;

    // OWNER LOCK
    if (message.author.id !== OWNER_ID) {
        return message.reply("❌ Not authorized.");
    }

    const args = message.content.slice(prefix.length).trim().split(" ");
    const cmd = args.shift()?.toLowerCase();

    /*
    ==========================
    HELP
    ==========================
    */

    if (cmd === "help") {
        return message.reply(
`**Mobby Bootloader Commands**

mb.help
mb.status

mb.startservices
mb.stopservices

mb.mt on/off
mb.tm on <time>`
        );
    }

    /*
    ==========================
    STATUS
    ==========================
    */

    if (cmd === "status") {

        let out = "**Mobby Bootloader Status**\n\n";

        for (const s of services.values()) {
            out += `**${s.name}** → ${s.status}\n`;
        }

        out += `\nMaintenance: ${maintenance ? "ON" : "OFF"}`;

        return message.reply(out);
    }

    /*
    ==========================
    START / STOP SERVICES
    ==========================
    */

    if (cmd === "startservices") {
        setAll("online");
        return message.reply("🟢 All services ONLINE");
    }

    if (cmd === "stopservices") {
        setAll("offline");
        return message.reply("🔴 All services OFFLINE");
    }

    /*
    ==========================
    MAINTENANCE TOGGLE
    ==========================
    */

    if (cmd === "mt") {

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

    /*
    ==========================
    TIMED MAINTENANCE
    ==========================
    */

    if (cmd === "tm") {

        const mode = args[0];
        const timeRaw = args[1];

        if (mode !== "on") {
            return message.reply("Usage: mb.tm on <time>");
        }

        const ms = parseTime(timeRaw);

        if (!ms) {
            return message.reply("Invalid time format (e.g. 5m, 10s, 2h)");
        }

        maintenance = true;

        if (maintenanceTimeout) {
            clearTimeout(maintenanceTimeout);
        }

        maintenanceTimeout = setTimeout(() => {
            maintenance = false;
            message.channel.send("🟢 Timed maintenance ended");
        }, ms);

        return message.reply(`🚧 Maintenance ON for ${timeRaw}`);
    }

});

/*
==========================
READY
==========================
*/

client.once("ready", () => {
    console.log(`Bootloader online as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

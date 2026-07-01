require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

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

/*
==========================
SERVICE REGISTRY
==========================
*/

function registerService(id, data = {}) {
    services.set(id, {
        id,
        name: data.name || id,
        status: "online",
        lastHeartbeat: Date.now()
    });
}

/*
Pre-register your bots
*/

registerService("mobby", { name: "Mobby" });
registerService("skycord", { name: "Skycord" });

/*
==========================
COMMAND HANDLER
==========================
*/

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    const prefix = "mb.";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift()?.toLowerCase();

    /*
    ==========================
    MAINTENANCE
    ==========================
    */

    if (command === "maintenance") {
        maintenance = !maintenance;

        return message.reply(
            maintenance
                ? "🚧 Maintenance ON"
                : "🟢 Maintenance OFF"
        );
    }

    /*
    ==========================
    STATUS
    ==========================
    */

    if (command === "status") {

        let output = "**Mobby Bootloader Status**\n\n";

        for (const service of services.values()) {
            output += `**${service.name}** - ${service.status}\n`;
        }

        output += `\nMaintenance: ${maintenance ? "ON" : "OFF"}`;

        return message.reply(output);
    }

    /*
    ==========================
    START / STOP (LOGICAL ONLY)
    ==========================
    */

    if (command === "startservices") {

        for (const s of services.values()) {
            s.status = "online";
        }

        return message.reply("▶️ All services marked ONLINE");
    }

    if (command === "stopservices") {

        for (const s of services.values()) {
            s.status = "offline";
        }

        return message.reply("⛔ All services marked OFFLINE");
    }

    /*
    ==========================
    RESTART SINGLE SERVICE
    ==========================
    */

    if (command === "restart") {

        const id = args[0];

        if (!services.has(id)) {
            return message.reply("❌ Service not found");
        }

        services.get(id).status = "restarting";

        setTimeout(() => {
            services.get(id).status = "online";
        }, 3000);

        return message.reply(`🔄 Restarted ${id}`);
    }

});

/*
==========================
LOGIN
==========================
*/

client.once("ready", () => {
    console.log(`Bootloader online as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

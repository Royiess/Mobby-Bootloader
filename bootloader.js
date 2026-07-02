require("dotenv").config();

const express = require("express");
const axios = require("axios");
const {
  Client,
  GatewayIntentBits,
  Collection
} = require("discord.js");

/*
==========================
CONFIG
==========================
*/

const OWNER_ID = "1101862076839886971";

const SERVICES = {
  mobby: "https://mobby.onrender.com",
  skycord: "https://skycord.onrender.com"
};

/*
==========================
DISCORD BOT
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
EXPRESS (Render health)
==========================
*/

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "Bootloader online",
    services: Object.keys(SERVICES)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP running on ${PORT}`);
});

/*
==========================
HELPER: SEND COMMAND
==========================
*/

async function sendToAll(command, enabled) {
  for (const name in SERVICES) {
    const url = SERVICES[name];

    try {
      await axios.post(`${url}/control`, {
        command,
        enabled
      }, {
        headers: {
          authorization: `Bearer ${process.env.BOOTLOADER_KEY}`
        }
      });

      console.log(`✔ ${name} → ${command}`);
    } catch (err) {
      console.log(`✖ ${name} failed`, err.message);
    }
  }
}

/*
==========================
COMMAND HANDLER
==========================
*/

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("mb.")) return;

  if (message.author.id !== OWNER_ID) return;

  const args = message.content.slice(3).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  switch (cmd) {

    case "help":
      return message.reply(
`**Mobby Bootloader**
mb.help
mb.status
mb.startservices
mb.stopservices
mb.mt on/off`
      );

    case "status":
      return message.reply("📡 Bootloader is online & controlling services.");

    /*
    ==========================
    START ALL
    ==========================
    */
    case "startservices":
      await sendToAll("startservices", false);
      return message.reply("🟢 All bots ONLINE");

    /*
    ==========================
    STOP ALL (DND)
    ==========================
    */
    case "stopservices":
      await sendToAll("stopservices", true);
      return message.reply("🔴 All bots DND");

    /*
    ==========================
    MAINTENANCE MODE
    ==========================
    */
    case "mt": {
      const mode = args[0];

      if (mode === "on") {
        await sendToAll("maintenance", true);
        return message.reply("🚧 Maintenance ON");
      }

      if (mode === "off") {
        await sendToAll("maintenance", false);
        return message.reply("🟢 Maintenance OFF");
      }

      return message.reply("Usage: mb.mt on/off");
    }

    default:
      return message.reply("Unknown command. Try mb.help");
  }
});

/*
==========================
READY (FIXED)
==========================
*/

client.once("ready", () => {
  console.log(`Bootloader logged in as ${client.user.tag}`);
});

/*
==========================
LOGIN
==========================
*/

client.login(process.env.TOKEN);

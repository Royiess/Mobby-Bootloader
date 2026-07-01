require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/*
==========================
STATE
==========================
*/

const services = {};

let maintenance = false;

/*
==========================
UTILS
==========================
*/

function now() {
    return Date.now();
}

function isTimedOut(service) {
    return now() - service.lastSeen > 90000;
}

/*
==========================
HEALTH CHECK
==========================
*/

app.get("/", (req, res) => {
    res.json({
        project: "Mobby Bootloader",
        version: "1.0.0",
        maintenance,
        onlineServices: Object.keys(services).length
    });
});

/*
==========================
HEARTBEAT (from bots/services)
==========================
*/

app.post("/heartbeat", (req, res) => {

    const { id, name, status, ping, ram, guilds } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Missing service id"
        });
    }

    services[id] = {
        id,
        name: name || id,
        status: status || "unknown",
        ping: ping ?? null,
        ram: ram ?? null,
        guilds: guilds ?? null,
        lastSeen: now()
    };

    res.json({ success: true });
});

/*
==========================
GET SERVICES
==========================
*/

app.get("/services", (req, res) => {
    res.json(services);
});

/*
==========================
MAINTENANCE CONTROL
==========================
*/

app.post("/maintenance", (req, res) => {

    if (req.headers.authorization !== `Bearer ${process.env.API_KEY}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    maintenance = !!req.body.enabled;

    console.log(`[BOOTLOADER] Maintenance = ${maintenance}`);

    res.json({ maintenance });
});

app.get("/maintenance", (req, res) => {
    res.json({ maintenance });
});

/*
==========================
COMMAND SYSTEM (THIS IS WHERE mb.* LIVES)
==========================
*/

const commands = new Map();

/*
Example:
commands.set("startservices", () => {...})
*/

commands.set("status", () => {
    return {
        services,
        maintenance
    };
});

commands.set("stopservices", () => {
    console.log("[BOOTLOADER] Stopping all services (logical state only)");
    for (const id in services) {
        services[id].status = "stopped";
    }
});

commands.set("startservices", () => {
    console.log("[BOOTLOADER] Marking services as starting...");
    for (const id in services) {
        services[id].status = "starting";
    }
});

commands.set("restartservice", ({ id }) => {
    if (!services[id]) return { error: "Service not found" };

    console.log(`[BOOTLOADER] Restart request: ${id}`);
    services[id].status = "restarting";
});

/*
==========================
COMMAND ENDPOINT
==========================
*/

app.post("/command", (req, res) => {

    if (req.headers.authorization !== `Bearer ${process.env.API_KEY}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { command, args } = req.body;

    const fn = commands.get(command);

    if (!fn) {
        return res.status(404).json({
            error: "Unknown command"
        });
    }

    const result = fn(args || {});

    res.json({
        command,
        result
    });
});

/*
==========================
CLEANUP DEAD SERVICES
==========================
*/

setInterval(() => {

    for (const id in services) {

        if (isTimedOut(services[id])) {

            console.log(`[BOOTLOADER] ${id} timed out`);

            services[id].status = "offline";

            delete services[id];
        }
    }

}, 10000);

/*
==========================
START SERVER
==========================
*/

app.listen(PORT, () => {
    console.log("");
    console.log("==================================");
    console.log(" Mobby Bootloader v2");
    console.log("==================================");
    console.log(` Running on port ${PORT}`);
    console.log(` Maintenance: ${maintenance}`);
    console.log(" Waiting for services...");
    console.log("==================================");
    console.log("");
});

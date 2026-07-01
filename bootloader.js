require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const PORT = process.env.PORT || 3000;

const bots = {};

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/*
==========================
Health Check
==========================
*/

app.get("/", (req, res) => {

    res.json({
        project: "Mobby Bootloader",
        version: "1.0.0",
        onlineBots: Object.keys(bots).length
    });

});

/*
==========================
Heartbeat
==========================
*/

app.post("/heartbeat", (req, res) => {

    const data = req.body;

    bots[data.name] = {

        status: data.status,
        ping: data.ping,
        ram: data.ram,
        guilds: data.guilds,

        lastSeen: Date.now()

    };

    res.json({
        success: true
    });

});

/*
==========================
Get Bots
==========================
*/

app.get("/bots", (req, res) => {

    res.json(bots);

});

/*
==========================
Maintenance
==========================
*/

let maintenance = false;

app.post("/maintenance", (req, res) => {

    if(req.headers.authorization !== `Bearer ${process.env.API_KEY}`){

        return res.status(401).json({
            error: "Unauthorized"
        });

    }

    maintenance = !!req.body.enabled;

    console.log(
        `Maintenance: ${maintenance}`
    );

    res.json({
        maintenance
    });

});

app.get("/maintenance", (req, res) => {

    res.json({
        maintenance
    });

});

/*
==========================
Cleanup
==========================
*/

setInterval(() => {

    const now = Date.now();

    for(const bot in bots){

        if(now - bots[bot].lastSeen > 90000){

            delete bots[bot];

            console.log(`${bot} timed out.`);

        }

    }

},10000);

/*
==========================
Start
==========================
*/

app.listen(PORT, () => {

    console.log("");
    console.log("==================================");
    console.log(" Mobby Bootloader");
    console.log("==================================");
    console.log(` Running on port ${PORT}`);
    console.log(" Waiting for bots...");
    console.log("==================================");
    console.log("");

});

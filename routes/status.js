const express = require("express");
const router = express.Router();

const { getServices } = require("../services/BotManager");

router.get("/", (req, res) => {
    res.json({
        services: getServices()
    });
});

module.exports = router;

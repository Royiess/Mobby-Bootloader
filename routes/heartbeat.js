const express = require("express");
const router = express.Router();

const { registerHeartbeat } = require("../services/HeartbeatManager");

router.post("/", (req, res) => {

    const { id, status, ping } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Missing service id" });
    }

    registerHeartbeat(id, { status, ping });

    res.json({ ok: true });

});

module.exports = router;

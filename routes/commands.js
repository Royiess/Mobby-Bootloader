const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

router.post("/broadcast", auth, (req, res) => {

    const { message } = req.body;

    // later: push to all bots via webhook/websocket

    res.json({
        success: true,
        message
    });

});

module.exports = router;

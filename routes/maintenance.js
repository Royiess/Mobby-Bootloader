const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

let maintenance = false;

router.get("/", (req, res) => {
    res.json({ maintenance });
});

router.post("/", auth, (req, res) => {

    maintenance = !!req.body.enabled;

    res.json({
        maintenance
    });

});

module.exports = router;

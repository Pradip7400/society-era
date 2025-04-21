const express = require("express");
const router = express.Router();

// Emergency page route
router.get("/", (req, res) => {
    res.render("emergency"); // Ensure emergency.ejs exists in views
});

module.exports = router;

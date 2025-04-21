// routes/profile.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// ✅ Use session check instead of req.isAuthenticated
function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect("/login");
}

router.get("/", isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("profile", {
            user,
            page: "profile",
        });
    } catch (error) {
        console.error("❌ Profile Route Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;

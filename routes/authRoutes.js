const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const router = express.Router();

// 🔹 Render Login Page
router.get("/login", (req, res) => {
    res.render("login", { errorMessage: null });
});

// 🔹 Handle Login Submission
router.post("/login", async (req, res) => {
    try {
        const { username, house_no, password } = req.body;
        const user = await User.findOne({ username, house_no });

        if (!user) {
            return res.render("login", { errorMessage: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { errorMessage: "Incorrect password!" });
        }

        // ✅ Store full user in session (including role)
        req.session.user = {
            _id: user._id,
            username: user.username,
            house_no: user.house_no,
            role: user.role || "member" // Default to 'member' if undefined
        };

        res.redirect("/homepage");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;

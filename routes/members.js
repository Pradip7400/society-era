const express = require("express");
const router = express.Router();
const User = require("../models/user");

const { isAdmin, isLoggedIn, isSelfOrAdmin } = require("../middleware/auth");

// 🔹 View Members — Everyone
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const members = await User.find({}, 'username house_no wing email mobile role');
        res.render("members", { members, currentUser: req.session.user });
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).send("Error fetching members");
    }
});

// 🔹 Render Edit Member Page — Admin or Self
router.get("/edit/:id", isSelfOrAdmin, async (req, res) => {
    try {
        const member = await User.findById(req.params.id);
        if (!member) {
            return res.status(404).send("Member not found");
        }
        res.render("edit-member", { member });
    } catch (error) {
        console.error("Error loading edit page:", error);
        res.status(500).send("Error loading edit page");
    }
});

// 🔹 Submit Edit — Admin or Self
router.post("/edit/:id", isSelfOrAdmin, async (req, res) => {
    try {
        const { username, house_no, mobile, email, role } = req.body;

        if (!house_no || !house_no.includes("-")) {
            return res.status(400).send("Invalid house number format");
        }

        const [wing, flatNumber] = house_no.split("-");

        // Only allow admin to change roles
        const updateData = {
            username,
            house_no,
            wing,
            flatNumber,
            mobile,
            email
        };

        if (req.session.user.role === 'admin') {
            updateData.role = role;
        }

        await User.findByIdAndUpdate(req.params.id, updateData);
        res.redirect("/members");
    } catch (error) {
        console.error("Error updating member details:", error);
        res.status(500).send("Error updating member details");
    }
});

// 🔹 Delete Member — Admin Only
router.get("/delete/:id", isAdmin, async (req, res) => {
    try {
        const deletedMember = await User.findByIdAndDelete(req.params.id);
        if (!deletedMember) {
            return res.status(404).send("Member not found");
        }
        res.redirect("/members");
    } catch (error) {
        console.error("Error deleting member:", error);
        res.status(500).send("Error deleting member");
    }
});

module.exports = router;

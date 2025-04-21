const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const { isLoggedIn, isAdminOrSecretary } = require("../middleware/auth");

// 🔹 Show All Notices – Everyone (Logged In)
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.render("notices", { notices, currentUser: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// 🔹 Render Create Notice Form – Admin or Secretary
router.get("/create", isAdminOrSecretary, (req, res) => {
    res.render("createNotice", { currentUser: req.session.user });
});

// 🔹 Add New Notice – Admin or Secretary
router.post("/create", isAdminOrSecretary, async (req, res) => {
    try {
        const { title, details } = req.body;
        await Notice.create({ title, details });
        res.redirect("/notices");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating notice");
    }
});

// 🔹 Render Edit Form – Admin or Secretary
router.get("/edit/:id", isAdminOrSecretary, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).send("Notice not found");
        res.render("editNotice", { notice, currentUser: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading edit form");
    }
});

// 🔹 Update Notice – Admin or Secretary
router.post("/update/:id", isAdminOrSecretary, async (req, res) => {
    try {
        const { title, details } = req.body;
        await Notice.findByIdAndUpdate(req.params.id, { title, details });
        res.redirect("/notices");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating notice");
    }
});

// 🔹 Delete Notice – Admin or Secretary
router.post("/delete/:id", isAdminOrSecretary, async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.redirect("/notices");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting notice");
    }
});

module.exports = router;

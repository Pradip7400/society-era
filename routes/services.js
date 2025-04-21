const express = require("express");
const router = express.Router();
const Service = require("../models/service");
const { isAdmin, isLoggedIn } = require("../middleware/auth");

// 🔹 Get all services — Anyone logged in
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const services = await Service.find();
        res.render("services", { services, currentUser: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// 🔹 Add new service form — Admin only
router.get("/add", isAdmin, (req, res) => {
    res.render("addService");
});

// 🔹 Add new service — Admin only
router.post("/add", isAdmin, async (req, res) => {
    try {
        const { type, provider, contact, address } = req.body;
        const newService = new Service({ type, provider, contact, address });
        await newService.save();
        res.redirect("/services");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding service");
    }
});

// 🔹 Edit service form — Admin only
router.get("/edit/:id", isAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).send("Service not found");
        res.render("editService", { service });
        currentUser: req.session.user
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading service details");
    }
});

// 🔹 Update service — Admin only
router.post("/update/:id", isAdmin, async (req, res) => {
    try {
        const { type, provider, contact, address } = req.body;
        await Service.findByIdAndUpdate(req.params.id, { type, provider, contact, address });
        res.redirect("/services");
        currentUser: req.session.user
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating service");
    }
});

// 🔹 Delete service — Admin only
router.post("/delete/:id", isAdmin, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.redirect("/services");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting service");
    }
});

module.exports = router;

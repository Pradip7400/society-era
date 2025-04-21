const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaints");
const { isLoggedIn, isAdminOrSecretary, canSubmitComplaint } = require("../middleware/auth");

// Optional: Add notification or confirmation logic here
console.log("Complaint system loaded.");

// Get all complaints - Admin/Secretary can see all, Members can only see their own
router.get("/", isLoggedIn, async (req, res) => {
    try {
        let complaints;
        if (req.session.user.role === 'admin' || req.session.user.role === 'secretary') {
            // Admin/Secretary can see all complaints
            complaints = await Complaint.find()
                .sort({ createdAt: -1 })
                .populate('userId', 'username house_no role')
                .lean();
        } else {
            // Members can only see their own complaints
            complaints = await Complaint.find({ userId: req.session.user._id })
                .sort({ createdAt: -1 })
                .populate('userId', 'username house_no role')
                .lean();
        }

        res.render("complaints", { 
            complaints,
            currentUser: req.session.user,
            isAdminOrSecretary: req.session.user.role === 'admin' || req.session.user.role === 'secretary',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        req.flash('error_msg', 'Error fetching complaints');
        res.redirect("/dashboard");
    }
});

// Create new complaint - Any logged-in user
router.post("/create", canSubmitComplaint, async (req, res) => {
    try {
        const { title, category, description } = req.body;

        // Validate required fields
        if (!title || !category || !description) {
            req.flash('error_msg', 'All fields are required');
            return res.redirect("/complaints");
        }

        // Validate field lengths
        if (title.length > 100 || description.length > 1000) {
            req.flash('error_msg', 'Title or description exceeds maximum length');
            return res.redirect("/complaints");
        }

        const newComplaint = new Complaint({
            title: title.trim(),
            category,
            description: description.trim(),
            userId: req.session.user._id,
            status: 'pending',
            assignedTo: 'admin', // Default assign to admin
            createdAt: new Date()
        });

        await newComplaint.save();
        req.flash('success_msg', 'Complaint submitted successfully!');
        res.redirect("/complaints");  // Redirect to the complaints list after successful submission
    } catch (error) {
        console.error("Error creating complaint:", error);
        req.flash('error_msg', 'Error creating complaint');
        res.redirect("/complaints");
    }
});

// Update complaint status - Admin/Secretary only
router.post("/update/:id", isAdminOrSecretary, async (req, res) => {
    try {
        const { status, response, assignedTo } = req.body;

        if (!status) {
            req.flash('error_msg', 'Status is required');
            return res.redirect("/complaints");
        }

        const updateData = {
            status,
            assignedTo: assignedTo || 'admin',
            response: response ? response.trim() : '',
            resolvedAt: status === 'resolved' ? new Date() : null,
            handledBy: req.session.user._id
        };

        await Complaint.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success_msg', 'Complaint updated successfully!');
        res.redirect("/complaints");  // Redirect back to complaints list after updating
    } catch (error) {
        console.error("Error updating complaint:", error);
        req.flash('error_msg', 'Error updating complaint');
        res.redirect("/complaints");
    }
});

// Delete complaint - Admin/Secretary only
router.post("/delete/:id", isAdminOrSecretary, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).send("Complaint not found");
        }
        await Complaint.findByIdAndDelete(req.params.id);
        res.redirect("/complaints");
    } catch (error) {
        console.error("Error deleting complaint:", error);
        res.status(500).send("Error deleting complaint");
    }
});

module.exports = router;

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    category: {
        type: String,
        required: true,
        enum: ['Maintenance', 'Security', 'Cleanliness', 'Noise', 'Parking', 'Others'],
        default: 'Others'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'in-progress', 'resolved']
    },
    response: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: String,
        enum: ['admin', 'secretary', null],
        default: 'admin'
    },
    handledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;

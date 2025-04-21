const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    type: { type: String, required: true },  // Service Type (Plumber, Electrician, etc.)
    provider: { type: String, required: true },  // Provider Name
    contact: { type: String, required: true },  // Phone Number
    address: { type: String, required: true }   // Service Address
});

module.exports = mongoose.model("Service", serviceSchema);

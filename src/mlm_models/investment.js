const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user_id: { type: String, required: true },
    package_id: { type: String, required: true },
    roi_max_days: { type: Number, required: true },
    roi_days: { type: Number, required: true },
    roi_amount: { type: Number, required: true },
    roi_paid: { type: Number, required: true }
}, { timestamps: true, collection: 'investment' });

module.exports = mongoose.model("investment", schema);

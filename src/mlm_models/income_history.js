const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user_id: { type: String, required: true },
    income_from: { type: String, required: true },
    amount: { type: Number, required: true },
    income_type: { type: String, required: true },
}, { timestamps: true, collection: 'incomehistory' });

module.exports = mongoose.model("incomehistory", schema);

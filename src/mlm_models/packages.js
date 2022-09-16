const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {type: String, required: true},
    amount: {type: Number, required: true},
    profit: {type: Number, required: true},
    duration: {type: Number, required: true},
    total_trades: {type: Number, required: true},
}, { timestamps: true, collection: 'packages' });

module.exports = mongoose.model("packages", schema);

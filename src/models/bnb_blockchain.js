const mongoose = require("mongoose");

const bnb_blockchain = new mongoose.Schema({
    last_block: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("bnb_blockchain", bnb_blockchain);

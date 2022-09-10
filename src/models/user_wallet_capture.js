const mongoose = require("mongoose");

const user_wallet_capture = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        tx_id: { type: Object },
        symbol: { type: String },
        amount: { type: String },
        from_address: { type: String },
        to_address: { type: String },
        type: { type: String },
    },
    { timestamps: true, collection: "user_wallet_capture" }
);

module.exports = mongoose.model("user_wallet_capture", user_wallet_capture);

const mongoose = require("mongoose");

const login_info = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        sys_info: { type: String, required: true },
        browser_info: { type: String, required: true },
        ip_address: { type: String, required: true },
        timestamp: { type: Number, required: true },
        access_token: { type: String, required: true, unique: true }
    },
    { timestamps: true, collection: "login_info" }
);

module.exports = mongoose.model("login_info", login_info);

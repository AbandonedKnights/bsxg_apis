const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        package_name :{ type:String, required:true },
        package :{ type: Number, required:true},
        profit_daily : { type: Number, required:true},
        duration: { type: Number }
    },
    { timestamps: true, collection: "plan" }
);

module.exports = mongoose.model("plan", planSchema);

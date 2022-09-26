const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user_id: { type: String, required: true },
    package_id: { type: String, required: true },
    roi_max_days: { type: Number, required: true },
    roi_days: { type: Number, default:0},
    roi_amount: { type: Number, default:0 },
    roi_paid: { type: Number, default:0 },
    invest_type: {type:Number, default:1},
    is_roi_expired: {type: Boolean, default: false},
    comments:{ type: String }
}, { timestamps: true, collection: 'investment' });

module.exports = mongoose.model("investment", schema);

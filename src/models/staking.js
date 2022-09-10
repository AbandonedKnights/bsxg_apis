const mongoose = require("mongoose");

const stakingSchema = new mongoose.Schema(
  {
    wallet_type: { type: String, required: true },
    user_id: { type: String, required: true },
    invest: { type: Number, required: true },
    usdtprice: {type: Number},
    staked: { type: Number, default: 0 },
    btexprice: {type: Number},
    type: {type: Number, required: true},
    percent: {type: Number, required: true},
    per_second_ry: {type: Number, required: true },
    harvestedAt: {type: Date, required: true}
  },
  { timestamps: true, collection: "staking" }
);

module.exports = mongoose.model("staking", stakingSchema);

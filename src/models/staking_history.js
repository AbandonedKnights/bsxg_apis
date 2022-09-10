const mongoose = require("mongoose");

const staking_historySchema = new mongoose.Schema(
  {
    wallet_type: { type: String, required: true },
    user_id: { type: String, required: true },
    harvest: { type: Number, default: 0 },
    type: {type: Number, required: true}
  },
  { timestamps: true, collection: "staking_history" }
);

module.exports = mongoose.model("staking_history", staking_historySchema);

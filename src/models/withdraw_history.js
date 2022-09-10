const mongoose = require("mongoose");

const withdraw_historySchema = new mongoose.Schema(
  {
    id: { type: String },
    user_id: { type:String },
    email: { type: String },
    tx_id: { type: String },
    symbol: { type: String },
    blockNumber: { type: String },
    status: { type: Number },
    amount: { type: Number },
    withdrawal_fee: { type: Number },
    from_address: { type: String },
    to_address: { type: String },
    type: { type: String },
    remark: {type: String},
    transection_id: { type: String },
    otp_varified: {type: Boolean},
  },
  { timestamps: true, collection: "withdraw_history" }
);

module.exports = mongoose.model("withdraw_history", withdraw_historySchema);

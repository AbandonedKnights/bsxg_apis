const mongoose = require("mongoose");

const inr_historySchema = new mongoose.Schema(
  {
    id: { type: String },
    user_id: { type:String },
    email: { type: String },
    screnshot: { type: String },
    request_no: { type : String },
    symbol: { type: String },
    status: { type: Number },
    amount: { type: String },
    balance: {type: String },
    type: { type: String },
    remark: {type: String},
    transection_id: { type: String },
  },
  { timestamps: true, collection: "inr_history" }
);

module.exports = mongoose.model("inr_history", inr_historySchema);

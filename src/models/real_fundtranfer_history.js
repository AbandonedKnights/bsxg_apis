const mongoose = require("mongoose");

const fundtranfer_historySchema = new mongoose.Schema(
  {
    to_user_id:    { type: String, },
    to_address:    { type: String, default:'' },
    from_address:    { type: String, default:'' },
    wallet_type:    { type: String },
    contract_type:    { type: String, default:''  },
    amount: { type: Number, default:0  },
    date:   { type: String, default: Date.now() },
  },
  { timestamps: true, collection: "real_fundtranfer_history" }
);

module.exports = mongoose.model("real_fundtranfer_history", fundtranfer_historySchema);

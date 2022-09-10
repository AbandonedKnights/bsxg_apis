const mongoose = require("mongoose");
const { decrypt } = require("../utils/functions");

const wallet_coldSchema = new mongoose.Schema(
  {
    wallet_type: { type: String },
    wallet_address: { type: String},
    //private_key: { type: String , get: decrypt, set: decrypt},
    private_key: { type: String},
    qr_code: { type: String },
    total_funds: { type: Number , default:0},
    contract_type: { type: String , default:''},
  },
  { timestamps: true, collection: "wallet_hot" }
);
//wallet_coldSchema.set('toObject', { getters: true });
//wallet_coldSchema.set('toJSON', { getters: true });

module.exports = mongoose.model("wallet_hot", wallet_coldSchema);

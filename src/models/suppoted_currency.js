const mongoose = require("mongoose");

const suppoted_currencySchema = new mongoose.Schema(
  {
    symbol: { type: String, required:true, unique: true, trim: true },
    name: { type: String, required:true, unique: true, trim: true },
    icon: { type: String, trim: true },                  
    dw: { type: Number },
    pairing_currency: { type: String },
    is_withdrawal: { type: Number, default: 0 },
    is_deposite: { type: Number, default: 0 },
    coin_status: { type: Boolean, default: true },
    contract_address: { type: String, default: '' },
    contract_type: { type: String, default: '' },
    withdrawal_fee: { type: Number, default: 0 },
    deposit_fee: { type: Number, default: 0 },
    precision: { type: Number },
    token_type: { type: String },
    sync_wallet: { type: Boolean, default:false },
    capture_fund: { type: Boolean, default:false },
    ac_balance: { type: Number, default:0 },
    min_withdraw_limit: { type: Number, default:0 },
    max_withdraw_limit: { type: Number, default:0 },
    daily_withdraw_limit: { type: Number, default:0 },
  },
  { timestamps: true, collection: "suppoted_currency" }
);

module.exports = mongoose.model("suppoted_currency", suppoted_currencySchema);

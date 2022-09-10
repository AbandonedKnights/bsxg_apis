const mongoose = require("mongoose");

const walletsSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    v_balanace: { type: Number, default: 0 },
    locked: { type: Number, default: 0 },
    date: { type: String, default: Date.now() },
    wallet_type: { type: String, default: '' },
    contract_type: { type: String, default: '' },
    contract_address: { type: String, default: '' },
    wallet_status: { type: Number, default: 0 }                                                                                                                                       ,
    admin_transfer: { type: Number, default: 0 },
    ac_balance: { type: Number, default: 0 },
    ac_last_date: { type: String, default: '' },
    ac_transfer_last_bal: { type: String, default: '' }
  }
);

const subcurrencySchema = new mongoose.Schema({
    private_key: { type: String, required: true },
    wallet_address: { type: String, required: true },
    blockchain: { type: String, required: true },
    walletsData: {
      type: [walletsSchema],
  },
});
const blockchainSchema = new mongoose.Schema({
  type: { type: String, required: true },
  subcurrencyData: {
    type: [subcurrencySchema],
},
});

const currencySchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  blockchainData: {
    type: [blockchainSchema],
},
}, 
{ timestamps: true, collection: "walletsv2" }
);


module.exports = mongoose.model("walletsv2", currencySchema);

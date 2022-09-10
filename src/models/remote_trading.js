const mongoose = require("mongoose");

const remote_tradingSchema = new mongoose.Schema(
  {
    price:    { type: Number , default : 0},
    low:    { type: Number , default : 0},
    high:   { type: Number , default : 0},
    compare_currency:   { type: String , required : true},
    currency_type:  { type: String, required : true },
    update_price:  { type: Boolean,default:false },
    status:  { type: Boolean,default:false },
    growth_rate:  { type: Number,default:50 },
  },
  { timestamps: true, collection: "remote_trading" }
);

module.exports = mongoose.model("remote_trading", remote_tradingSchema);

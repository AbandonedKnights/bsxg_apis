const mongoose = require("mongoose");

const direct_buy_sellSchema = new mongoose.Schema({
    order_id: { type: String },
    user_id: { type: String },
    raw_price: { type: Number },
    currency_type: { type: String },
    compare_currency: { type: String },
    volume: { type: String },
    order_status: { type: Number },
    executed_from:   { type: String },
    type:{type:String}
}, { timestamps: true, collection: 'direct_buy_sell' });

module.exports = mongoose.model("direct_buy_sell", direct_buy_sellSchema);

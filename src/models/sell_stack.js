const mongoose = require("mongoose");

const sell_stackSchema = new mongoose.Schema({
    order_id: { type: String},
    user_id: { type: String},
    raw_price: { type: Number},
    currency_type: { type: String},
    compare_currency: { type: String}, 
    volume: { type: String},
    order_date: { type: String},
    execution_time: { type: String},
    total_executed: { type: String},
    last_reansaction: { type: String},
    order_status: { type: Number},
    executed_from: { type: String },
    order_type: { type: String, default: 'exc' },
    deleted_by: { type: String, default: '' },
    is_admin: { type: Boolean, default: false },
}, { timestamps: true, collection: 'sell_stack' });

module.exports = mongoose.model("sell_stack", sell_stackSchema);

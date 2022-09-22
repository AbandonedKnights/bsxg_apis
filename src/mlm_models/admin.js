const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    helping_hand : {type:Number, default:0},
    withdraw_fee : {type: Number, default:0},
    income_fees:   { type:Number, default:0},
    total_business: { type:Number, default:0},
    total_withdraw: {type:Number, default:0},
    total_babydoge: {type:Number, default:0},
    total_shiba :{ type:Number, default:0},
    
}, { timestamps: true, collection: 'admin' });

module.exports = mongoose.model("admin", schema);

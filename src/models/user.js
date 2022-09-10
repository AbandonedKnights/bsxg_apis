const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: false },
    promoter_id: { type: String, required: false },
    name:{type: String},
    email: { type: String, required: false },
    hashedPassword: { type: String, required: false },
    mobile_number: { type: String, default: '' },
    created_on: {type: String, default: Date.now()},
    self_ref_code: { type: String, default: '' },
    parent_ref_code: { type: String, default: '' },
    user_role: { type: Number, default: 0 },
    is_email_verified: { type: Number , default: false, required: true},
    is_mobile_verified: { type: Number, default: false, required: true },
    loginToken: { type: String, default: '' },
    referral_income: { type: Number, default: 0.0 },
    ip_address: { type: String, default: '' },
    wallet_password: { type: String, default: ''},
    user_status: { type: Number, default: 1},
    authenticator:{ type: Number, default:0},
    secret_key:{ type: Object, default:false},
    ask_login_otp:{ type: Number, default:0},
    directs:{ type: Number, default:0},
    admin_permission:{ type: Array, default:[]}
  },
  { timestamps: true, collection: "user" }
);

module.exports = mongoose.model("user", userSchema);

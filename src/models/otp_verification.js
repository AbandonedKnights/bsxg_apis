const mongoose = require("mongoose");
//const bcrypt = require("bcrypt");

const otpVerification = new mongoose.Schema(
  {
    user_id: { type: String },
    email: { type: String },
    mobile: { type: String },
    //email_otp: { type: String, default: null },
    //mobile_otp: { type: String, default: null },
    //kyc_otp: { type: String, default: null },
    otp: { type: String, default: null },
    is_otp_verified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "otp_verification" }
);

module.exports = mongoose.model("OTPVerification", otpVerification);

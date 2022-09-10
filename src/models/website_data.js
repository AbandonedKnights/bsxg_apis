const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    website_name: { type: String, default: '' },
    bg_color: { type: String, default: "" },
    bg_color_code: { type: String, default: "" },
    website_title: { type: String, default: '' },
    website_short_name: { type: String, default: '' },
    website_disc: { type: String, default: "" },
    support_email: { type: String, default: "" },
    contact_email: { type: String, default: "" },
    info_email: { type: String, default: "" },
    noreply_email: { type: String, default: "" },
    about_us: { type: String, default: "" },
    logo_img_name: { type: String, default:''},
    favicon_img_name: { type: String, default: "" },
    slogo_img_name: { type: String, default: "" },
    logo_with_title: { type: String, default: "" },
    cms_key: { type: String, default: "" },
    rozarpay_key: { type: String, default: "" },
    msg91_smskey: { type: String, default: "" },
    msg91_emailkey: { type: String, default: "" },
    commision_fee: { type: String, default: "" },
    referral_coin: { type: String, default: "" },
    referral_fee: { type: Number, default: "" },
    airdrop_coin: { type: String, default: "" },
    airdrop_fee: { type: Number, default: "" },
    maker_fees: { type: Number, default: 0 },
    taker_fees: { type: Number, default: 0 },
    trade_fees: { type: Number, default: 0 },
    wallet_password: { type: String, default: "123456" },
    parrow_api_key: { type: String, default:''},
    parrow_key_password: {type: String, default:''},
    one_stake: {type: Number, default: 90 },
    second_stake: {type: Number, default: 180 },
    third_stake: {type: Number, default: 270 },
    fourth_stake: {type: Number, default: 365 },
    one_stake_percent: {type: Number, default: 6 },
    second_stake_percent: {type: Number, default: 12 },
    third_stake_percent: {type: Number, default: 18 },
    fourth_stake_percent: {type: Number, default: 30 }
  },
  { timestamps: true, collection: "website_data" }
);

module.exports = mongoose.model("website_data", settingSchema);

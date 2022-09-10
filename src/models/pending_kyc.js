const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: false, unique: false },
    first_name: { type: String, default: '' },
    middle_name: { type: String,default: '' },
    last_name: { type: String, default: '' },
    date_of_birth: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    zip_code: { type: String, default: '' },
    added_on: { type: String, default: '' },
    kyc_type: { type: String , default: 'individual'  },
    doc_1_type: { type: String, default: '' },
    doc_1_no: {type: String, default: ''},
    doc_1_s: { type: String, default: '' },
    doc_1_f: { type: String, default: '' },
    doc_1_b: { type: String, default: '' },
    doc_2_type: { type: String , default: 'pancard',},
    doc_2_no: { type: String, default: '' },
    doc_2_f: { type: String, default: '' },
    status: { type: Number, default: 0 },
    auditing_date: { type: String, default: '' },
    auditor_msg: { type: String, default: '' },
    mobile_no: {type: String, default: ""},
    auto_verify: {type: Boolean, default: false}
  },
  { timestamps: true, collection: "pending_kyc" }
);

module.exports = mongoose.model("pending_kyc", userSchema);

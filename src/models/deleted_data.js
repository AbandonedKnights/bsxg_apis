const mongoose = require("mongoose");

const walletsSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    email: { type: String, default : '' },
    field_1: { type: String, default : '' },
    field_2: { type: String, default : '' },
    field_3: { type: String, default : '' },
    collection_name: { type: String,required: true},
    action_by: { type: String,required: true},
    action_message: { type: String,required: true},
    data: { type: Object,default : {}},
  },
  { timestamps: true, collection: "deleted_data" }
);

module.exports = mongoose.model("deleted_data", walletsSchema);

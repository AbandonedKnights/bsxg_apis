const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user_id: { type: String, required:true },
    _from: { type: String, required:true },
    message: { type: String, required:true }
  },
  { timestamps: true, collection: "chat" }
);

module.exports = mongoose.model("chat", chatSchema);

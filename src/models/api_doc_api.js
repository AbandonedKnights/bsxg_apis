const mongoose = require("mongoose");

const api_doc_api = new mongoose.Schema(
  {
    heading: { type: String },
    title: { type: String },
    header: [
      {
        key: { type: String },
      },
    ],
    url: { type: String, required: true },
    parameters: [
      {
        name: { type: String },
        type: { type: String },
        mandatory: { type: String },
        description: { type: String },
      },
    ],
    response: { type: Object},
    note: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("api_doc_api", api_doc_api);

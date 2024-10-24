const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name field is required."],
  },
  email: {
    type: String,
    required: [true, "Email field is required."],
    validate: [validator.isEmail, "Enter valid  email address."],
    unique: true,
  },
  phone: {
    type: Number,
    required: [true, "Phone field is required."],
  },
  address: {
    type: Object,
    required: [true, "Address field is required."],
  },
  timezone: {
    type: String,
    enum: [
      "UTC",
      "GMT",
      "EST",
      "PST",
      "CST",
      "IST",
      "CET",
      "EET",
      "AST",
      "HKT",
      "JST",
      "AEST",
      "ACST",
      "AKST",
    ],
    default: "UTC",
  },
},{timestamps:true});

const Contacts = mongoose.model("Contacts",contactSchema);

module.exports = Contacts;
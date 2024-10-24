const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

exports.transporter = nodemailer.createTransport({
  server: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const express = require("express");
const {registerUser,loginUser,verifyEmailOTP,forgotPassword,forgotPasswordVerification} = require("../controllers/authController");

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/verify",verifyEmailOTP);
router.post("/forgot",forgotPassword);
router.post("/reset",forgotPasswordVerification);

module.exports = router;
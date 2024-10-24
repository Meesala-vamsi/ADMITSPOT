const Users = require("../models/userModel");
const { asyncHandler } = require("../utils/asyncHandler");
const CustomError = require("../utils/customError");
const {transporter}= require("../utils/nodemailer");
const jwt = require("jsonwebtoken");

exports.authProtectedRoute = async (req, res, next) => {
  const authHead = req.headers.authorization;
  if (authHead === undefined) {
    const error = new CustomError("Invalid jwt token", 401);
    next(error);
  }
  const token = authHead.split(" ")[1];

  if (token === undefined) {
    const error = new CustomError("Invalid jwt token", 401);
    next(error);
  } else {
    jwt.verify(token, process.env.JWT_SECRET, async (error, data) => {
      if (error) {
        const error = new CustomError("Invalid Jwt token", 401);
        return next(error);
      } else {
        const user = await Users.findById(data.id);
        req.user = user;
        next();
      }
    });
  }
};

//functionality to generate random otp..
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (payload, res) => {
  const createJwtToken = jwt.sign(payload, process.env.JWT_SECRET);
  return createJwtToken;
};

//Functionality to send mail...
const sendOTPEmail=(email,emailOTP,mailText,subject)=>{
  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: email,
    subject: `${subject}`,
    text: `${mailText} ${emailOTP}`,
    html: `<p>${mailText} <strong>${emailOTP}</strong></p>`,
  };

  transporter.sendMail(mailOptions,(error,info)=>{
    if(error){
      console.log(error)
    }else{
      console.log("OTP sent successfully:", info.response);
    }
  })
};

exports.registerUser = asyncHandler(async(req,res,next)=>{
  const {email,username,password} = req.body;

  const checkUser = await Users.findOne({email});

  if(checkUser){
    const error = new CustomError("User already exists.",400);
    return next(error);
  }
  
  const user = await Users.create({
    email,
    password,
    username
  });

  const emailOTP = generateOTP();
  const mailText = "Your OTP for email verification is:";
  const subject = "Your Email OTP Code";
  sendOTPEmail(email, emailOTP,mailText,subject);

  req.session.emailOTP = emailOTP;
  req.session.userId = user._id;
  req.session.otpExpiresAt = Date.now() + 10 * 60 * 1000;

  res.status(201).json({
    status:"success",
    message:"User created successfully."
  });
  req.session.save();
});

exports.loginUser = asyncHandler(async(req,res,next)=>{
  const {email,password} = req.body;
  const user = await Users.findOne({email});

  if(!user){
    const error = new CustomError("User not found with given credentials.",404);
    return next(error);
  }

  if (!(await user.comparePasswords(password, user.password))) {
    const error = new CustomError("Invalid Password", 404);
    return next(error);
  }

  if (!user.isEmailVerified) {
    const error = new CustomError(
      "Please verify your email to login.",401
    );
    return next(error);
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    username: user.username,
  });

  res.status(200).json({
    status:"success",
    token,
    data:{
      message:"User logged in successfully...",
      user:{
        email:user.email,
        username:user.username,
        id:user._id
      }
    }
  })
});

//Forgot password
exports.forgotPassword = asyncHandler(async(req,res,next)=>{
  const {email} = req.body;
  const user = await Users.findOne({email});
  if(!user){
    const error = new CustomError("User not found.please enter valid credentials",404);
    return next(error);
  }

  const forgotPasswordOTP = generateOTP();
  const mailText = "Your OTP for password reset";
  const subject = "Password reset"
  sendOTPEmail(email,forgotPasswordOTP,mailText,subject);

  req.session.forgotPass = forgotPasswordOTP;
  req.session.forgotUserId = user._id;
  req.session.forgotPassOTPExpiresAt = Date.now() + 10 * 60 * 1000;

  res.status(200).json({
    message:"OTP sent successfully"
  })
  req.session.save();
})


// Verify OTP for password reset
exports.forgotPasswordVerification = asyncHandler(async (req, res, next) => {
  const { otp, newPassword } = req.body;

  console.log(otp)
  console.log(req.session.forgotPass);

  if (otp === req.session.forgotPass && Date.now() < req.session.forgotPassOTPExpiresAt) {
    try {
      const user = await Users.findById(req.session.forgotUserId);
      user.password = newPassword;
      await user.save();

      req.session.forgotPass = null;
      req.session.forgotPassOTPExpiresAt = null;
      req.session.forgotUserId = null;

      res.status(200).json({
        status: "success",
        message: "Password reset successful."
      });
    } catch (error) {
      return next(new CustomError("Failed to reset password. Please try again.", 500));
    }
  } else {
    return res.status(400).json({
      status: "error",
      message: "Invalid or expired OTP. Please try again."
    });
  }
});


exports.verifyEmailOTP = asyncHandler(async (req, res, next) => {
  const { enteredEmailOTP } = req.body;
  console.log(enteredEmailOTP);
  console.log(req.session.emailOTP);
  console.log(req.session);
  if (enteredEmailOTP === req.session.emailOTP) {
    try {
      await Users.findByIdAndUpdate(
        { _id: req.session.userId },
        { isEmailVerified: true },
        { new: true, runValidators: true }
      );

      req.session.emailOTP = null;
      req.session.otpExpiresAt = null;
      req.session.userId = null;

      return res
        .status(200)
        .json({ status: "success", message: "Email verification successful" });
    } catch (error) {
      return next(
        new CustomError("Failed to verify email. Please try again.", 500)
      );
    }
  } else {
    return res
      .status(400)
      .json({ message: "Invalid email OTP. Please try again." });
  }
});
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required."],
  },
  email: {
    type: String,
    required: [true, "Email field is required."],
    validate: [validator.isEmail, "Enter a valid email address."],
    unique:true
  },
  password: {
    type: String,
    required: [true, "Password field is required."],
  },
  isEmailVerified:{
    type:Boolean,
    default:false
  }
},{timestamps:true});

userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePasswords = async function (pass, passDB) {
  return await bcrypt.compare(pass, passDB);
};

const Users = mongoose.model("Users",userSchema);

module.exports = Users;
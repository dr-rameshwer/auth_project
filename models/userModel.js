import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  createdAt: { type: Date, default: Date.now },
});

const UserModelAuth = mongoose.model("UserModelAuth", userSchema);

export default UserModelAuth;

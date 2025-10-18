import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import User from "./models/User.js"; // adjust path to your User model

dotenv.config();

const changePassword = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "test@example.com"; // the user’s email
  const newPassword = "newpassword123";

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await User.findOneAndUpdate(
    { email },
    { password: hashedPassword },
    { new: true }
  );

  console.log("Password updated for:", updatedUser.email);
  mongoose.disconnect();
};

changePassword();
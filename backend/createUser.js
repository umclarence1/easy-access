// createUser.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// 1. MongoDB connection URI
const MONGO_URI = "mongodb://localhost:27017/authdb";

// 2. Define User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// 3. Create a test user
async function createUser() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("cccmanu7", 10);

    const user = await User.create({
      email: "manuclarance85@gmail.com",
      password: hashedPassword,
    });

    console.log("✅ User created:", user.email);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createUser();

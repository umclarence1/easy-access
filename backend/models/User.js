import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifyToken: String,
  verifyTokenExpiry: Date
}, { timestamps: true });

// 👇 Use named export
const User = mongoose.model('User', userSchema);
export default User;

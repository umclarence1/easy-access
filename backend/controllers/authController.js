import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

// ...rest of your code...

// 🔐 Signup
export const signup = async (req, res) => {
  try {
    console.log("Signup body:", req.body);
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      email,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await newUser.save();

    const verifyURL = `${process.env.BASE_URL}/api/auth/verify/${verifyToken}`;
    await sendEmail(email, 'Verify Your Email', `Click to verify your email: ${verifyURL}`);

    res.status(201).json({ message: 'User created. Verification email sent.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// ✅ Email verification
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token.' });

    user.verified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error during email verification.' });
  }
};

// 🔑 Login
export const login = async (req, res) => {
  console.log("🟡 LOGIN BODY:", req.body); // 👈 This MUST log
  const { email, password } = req.body;

  try {
   const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });

if (!user.verified) {
  return res.status(403).json({ message: 'Please verify your email before logging in.' });
}

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔁 Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No user found with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${process.env.BASE_URL}/api/auth/reset-password/${resetToken}`;
    await sendEmail(email, 'Password Reset', `Reset your password here: ${resetURL}`);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error during forgot password.' });
  }
};

// 🔁 Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset token.' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { sendToken } = require('../middleware/auth');
const { sendEmail, templates } = require('../services/mailer');

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];
exports.loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Create Account
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered. Please log in.' });
  const user = await User.create({ name, email, phone, password }); // role is never taken from the client
  sendEmail({ to: user.email, subject: 'Welcome to T01', html: templates.welcome(user.name) });
  sendToken(user, 201, res);
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  sendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: env.isProd, sameSite: 'lax' });
  res.json({ success: true });
};

exports.me = (req, res) => {
  const u = req.user;
  res.json({ success: true, user: { id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role } });
};

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  await req.user.save({ validateModifiedOnly: true });
  exports.me(req, res);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
  if (user) {
    const token = user.createResetToken();
    await user.save({ validateBeforeSave: false });
    sendEmail({ to: user.email, subject: 'Reset your T01 password', html: templates.resetPassword(user.name, `${env.clientUrl}/reset-password/${token}`) });
  }
  // Same response either way so emails cannot be enumerated
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  if (!req.body.password || req.body.password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } }).select('+resetPasswordToken +resetPasswordExpire');
  if (!user) return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpire });

const sendToken = (user, status, res) => {
  const token = signToken(user._id);
  res
    .status(status)
    .cookie('token', token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'lax', // "lax" so the cookie survives the redirect back from the payment page
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
};

const protect = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    const token = req.cookies?.token || bearer;
    if (!token) return res.status(401).json({ success: false, message: 'Please log in to continue' });

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Session expired. Please log in again' });
  }
};

const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ success: false, message: 'Not allowed' });

module.exports = { protect, authorize, sendToken };

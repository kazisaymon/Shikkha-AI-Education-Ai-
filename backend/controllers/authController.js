const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'ইমেইল আগে থেকে নিবন্ধিত / Email already registered' });

    const assignedRole = role === 'admin' ? 'student' : (role || 'student');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, role: assignedRole, phone: phone || '', verificationToken });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: email, subject: 'Shikkha AI - Email Verification',
      html: `<h2>স্বাগতম ${name}!</h2><p>ইমেইল যাচাই করুন:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    }).catch(() => {});

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'ইমেইল ও পাসওয়ার্ড দিন' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'অ্যাকাউন্ট নিষ্ক্রিয়' });

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, avatar: user.avatar, language: user.language, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses', 'title titleBn thumbnail');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, language, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, language, avatar }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'বর্তমান পাসওয়ার্ড ভুল' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'পাসওয়ার্ড পরিবর্তন সফল' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ success: false, message: 'টোকেন অকার্যকর' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ success: true, message: 'ইমেইল যাচাই সফল!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email, subject: 'Shikkha AI - পাসওয়ার্ড রিসেট',
      html: `<h2>পাসওয়ার্ড রিসেট</h2><p>নিচের লিঙ্কে ক্লিক করুন (১০ মিনিট বৈধ):</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ success: true, message: 'রিসেট ইমেইল পাঠানো হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ইমেইল পাঠানো সম্ভব হয়নি' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'টোকেন মেয়াদ শেষ বা অকার্যকর' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, message: 'পাসওয়ার্ড রিসেট সফল' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

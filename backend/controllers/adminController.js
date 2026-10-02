const User = require('../models/User');
const Course = require('../models/Course');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const ChatHistory = require('../models/ChatHistory');

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalTests, totalResults] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Test.countDocuments(),
      TestResult.countDocuments(),
    ]);
    const roleStats = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({ success: true, stats: { totalUsers, totalCourses, totalTests, totalResults, roleStats } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(filter).sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Update user (role, active status)
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive, name, email }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ success: false, message: 'নিজেকে মুছতে পারবেন না' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'ব্যবহারকারী মুছে ফেলা হয়েছে' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Create admin user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: role || 'student', isVerified: true });
    res.status(201).json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

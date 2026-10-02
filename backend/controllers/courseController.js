const Course = require('../models/Course');
const User = require('../models/User');

// Get all published courses
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { titleBn: { $regex: search, $options: 'i' } }];
    const courses = await Course.find(filter).populate('teacher', 'name avatar').select('-lessons -classMaterials').sort('-createdAt');
    res.json({ success: true, count: courses.length, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get all courses (admin)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name avatar').sort('-createdAt');
    res.json({ success: true, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name avatar email');
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    res.json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, teacher: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $push: { createdCourses: course._id } });
    res.status(201).json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
    }
    await course.deleteOne();
    res.json({ success: true, message: 'কোর্স মুছে ফেলা হয়েছে' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Enroll student
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'আপনি আগেই ভর্তি হয়েছেন' });
    }
    course.enrolledStudents.push(req.user._id);
    await course.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });
    res.json({ success: true, message: 'ভর্তি সফল!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get my courses (teacher)
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).sort('-createdAt');
    res.json({ success: true, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Add lesson
exports.addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
    }
    const { title, titleBn, content, videoUrl, duration } = req.body;
    const order = course.lessons.length + 1;
    course.lessons.push({ title, titleBn, content, videoUrl, duration: duration || 0, order });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Add class material (note/recording/file)
exports.addClassMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
    }
    const { type, title, titleBn, description, fileUrl, videoUrl, content, week } = req.body;
    course.classMaterials.push({ type, title, titleBn, description, fileUrl, videoUrl, content, week: week || 1, uploadedBy: req.user._id });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Delete class material
exports.deleteClassMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'কোর্স পাওয়া যায়নি' });
    course.classMaterials = course.classMaterials.filter(m => m._id.toString() !== req.params.matId);
    await course.save();
    res.json({ success: true, message: 'মুছে ফেলা হয়েছে' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

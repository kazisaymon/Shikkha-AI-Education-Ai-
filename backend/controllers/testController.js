const Test = require('../models/Test');
const TestResult = require('../models/TestResult');

// Get all published tests
exports.getTests = async (req, res) => {
  try {
    const { type, subject, course } = req.query;
    const filter = { isPublished: true };
    if (type) filter.type = type;
    if (subject) filter.subject = subject;
    if (course) filter.course = course;
    const tests = await Test.find(filter).populate('createdBy', 'name').select('-questions').sort('-createdAt');
    res.json({ success: true, tests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get all tests (admin/teacher)
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().populate('createdBy', 'name').sort('-createdAt');
    res.json({ success: true, tests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get single test (with questions for taking)
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('createdBy', 'name');
    if (!test) return res.status(404).json({ success: false, message: 'টেস্ট পাওয়া যায়নি' });
    res.json({ success: true, test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Create test
exports.createTest = async (req, res) => {
  try {
    const totalMarks = (req.body.questions || []).reduce((s, q) => s + (q.marks || 1), 0);
    const test = await Test.create({ ...req.body, createdBy: req.user._id, totalMarks, passingMarks: req.body.passingMarks || Math.ceil(totalMarks * 0.4) });
    res.status(201).json({ success: true, test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Update test
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ success: false, message: 'টেস্ট পাওয়া যায়নি' });
    res.json({ success: true, test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Delete test
exports.deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'টেস্ট মুছে ফেলা হয়েছে' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Submit test
exports.submitTest = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'টেস্ট পাওয়া যায়নি' });

    let score = 0;
    const gradedAnswers = answers.map((ans) => {
      const q = test.questions[ans.questionIndex];
      const isCorrect = q && ans.selectedAnswer === q.correctAnswer;
      if (isCorrect) score += q.marks || 1;
      return { ...ans, isCorrect };
    });

    const percentage = Math.round((score / test.totalMarks) * 100);
    const passed = score >= test.passingMarks;

    const result = await TestResult.create({
      test: test._id, student: req.user._id,
      answers: gradedAnswers, score, totalMarks: test.totalMarks,
      percentage, timeTaken: timeTaken || 0, passed,
    });

    res.json({ success: true, result, test: { title: test.title, totalMarks: test.totalMarks, passingMarks: test.passingMarks } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get my results
exports.getMyResults = async (req, res) => {
  try {
    const results = await TestResult.find({ student: req.user._id }).populate('test', 'title titleBn type subject').sort('-submittedAt');
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get test results (admin/teacher)
exports.getTestResults = async (req, res) => {
  try {
    const results = await TestResult.find({ test: req.params.id }).populate('student', 'name email').sort('-submittedAt');
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

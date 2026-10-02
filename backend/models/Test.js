const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionBn: String,
  options: [{ text: String, textBn: String }],
  correctAnswer: { type: Number, required: true }, // index 0-3
  explanation: String,
  explanationBn: String,
  marks: { type: Number, default: 1 },
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleBn: String,
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // optional
  type: { type: String, enum: ['unit', 'exam', 'mock', 'practice'], default: 'unit' },
  subject: { type: String, default: 'general' },
  questions: [questionSchema],
  duration: { type: Number, default: 30 }, // minutes
  totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  allowedRoles: [{ type: String, enum: ['student', 'teacher'] }],
  startTime: Date,
  endTime: Date,
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);

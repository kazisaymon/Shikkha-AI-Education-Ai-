const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleBn: String,
  content: String,
  videoUrl: String,
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
  resources: [{ name: String, fileUrl: String, fileType: String }],
});

// Class Materials (Class Note, Recording, File)
const classMaterialSchema = new mongoose.Schema({
  type: { type: String, enum: ['note', 'recording', 'file', 'video'], required: true },
  title: { type: String, required: true },
  titleBn: String,
  description: String,
  fileUrl: String,
  videoUrl: String,
  content: String, // for notes
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  week: { type: Number, default: 1 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleBn: { type: String, required: true },
  description: String,
  descriptionBn: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['math', 'science', 'language', 'computer', 'hsc', 'ssc', 'jsc', 'other'], default: 'other' },
  thumbnail: { type: String, default: '' },
  lessons: [lessonSchema],
  classMaterials: [classMaterialSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: false },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  price: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

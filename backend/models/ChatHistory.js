const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);

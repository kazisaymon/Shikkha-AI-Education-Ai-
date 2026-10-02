// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { chat, summarize, getChatHistories, getChatHistory, deleteChat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chat);
router.post('/summarize', protect, summarize);
router.get('/histories', protect, getChatHistories);
router.get('/history/:id', protect, getChatHistory);
router.delete('/history/:id', protect, deleteChat);

module.exports = router;

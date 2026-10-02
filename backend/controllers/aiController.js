const ChatHistory = require('../models/ChatHistory');

const SYSTEM_PROMPT = `You are Shikkha AI (শিক্ষা AI), an intelligent and friendly education assistant built specifically for Bangladeshi students and teachers.

Core capabilities:
- Explain academic concepts clearly in both Bangla and English
- Summarize notes, textbook chapters, and study materials
- Analyze images of textbooks, handwritten notes, diagrams, and mathematical problems
- Help solve math, science, language, and computer science problems
- Provide step-by-step explanations suitable for different learning levels
- Generate practice questions and quizzes
- Be culturally sensitive to Bangladeshi context (JSC, SSC, HSC exams)

Language behavior:
- Always respond in the SAME language the user writes in
- If Bangla → respond in Bangla. If English → respond in English.

Personality:
- Warm, encouraging, and patient like a good teacher
- Use emojis to make responses engaging but not excessive
- Be culturally sensitive to Bangladeshi context

Formatting:
- Use **bold** for key terms
- Use numbered lists for steps
- Use bullet points for features
- Always end with an encouraging note`;

// Try Anthropic Claude
async function callAnthropic(messages, imageBase64, imageMimeType) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('No Anthropic key');
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userContent = [];
  if (imageBase64) {
    userContent.push({ type: 'image', source: { type: 'base64', media_type: imageMimeType || 'image/jpeg', data: imageBase64 } });
  }
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.content) userContent.push({ type: 'text', text: lastMsg.content });

  const apiMessages = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
  apiMessages.push({ role: 'user', content: userContent });

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  });
  return response.content[0].text;
}

// Try Gemini
async function callGemini(messages, imageBase64, imageMimeType) {
  if (!process.env.GEMINI_API_KEY) throw new Error('No Gemini key');
  const fetch = require('node-fetch');

  const lastMsg = messages[messages.length - 1];
  const parts = [];

  if (imageBase64) {
    parts.push({ inline_data: { mime_type: imageMimeType || 'image/jpeg', data: imageBase64 } });
  }
  if (lastMsg?.content) parts.push({ text: lastMsg.content });

  // Build conversation history for Gemini
  const contents = [];
  const historyMsgs = messages.slice(0, -1);
  for (const m of historyMsgs) {
    contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
  }
  contents.push({ role: 'user', parts });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
  };

  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

// Chat
exports.chat = async (req, res) => {
  try {
    const { message, chatId, imageBase64, imageMimeType } = req.body;
    if (!message && !imageBase64) return res.status(400).json({ success: false, message: 'Message or image required' });

    let history = await ChatHistory.findById(chatId);
    if (!history) {
      history = await ChatHistory.create({ user: req.user._id, messages: [], title: message?.slice(0, 50) || 'Image Chat' });
    }

    const recentMessages = history.messages.slice(-20);
    const messages = [...recentMessages, { role: 'user', content: message || '[Image uploaded]' }];

    let assistantMessage;
    let aiProvider = 'unknown';

    // Try Anthropic first, then Gemini
    try {
      assistantMessage = await callAnthropic(messages, imageBase64, imageMimeType);
      aiProvider = 'Claude';
    } catch (e1) {
      console.log('Anthropic failed, trying Gemini:', e1.message);
      try {
        assistantMessage = await callGemini(messages, imageBase64, imageMimeType);
        aiProvider = 'Gemini';
      } catch (e2) {
        console.error('Both AI providers failed:', e2.message);
        return res.status(503).json({ success: false, message: 'AI সেবা এখন পাওয়া যাচ্ছে না। API key সেট করুন।' });
      }
    }

    history.messages.push({ role: 'user', content: message || '[Image uploaded]' });
    history.messages.push({ role: 'assistant', content: assistantMessage });
    await history.save();

    res.json({ success: true, message: assistantMessage, chatId: history._id, provider: aiProvider });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Summarize
exports.summarize = async (req, res) => {
  try {
    const { text, language = 'bn' } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text required' });

    const prompt = language === 'bn'
      ? `নিচের টেক্সটটির একটি সহজ, সুসংগঠিত সারসংক্ষেপ বাংলায় লিখুন। মূল পয়েন্টগুলো বুলেট পয়েন্টে দিন:\n\n${text}`
      : `Please provide a clear, concise summary. Include key points as bullet points:\n\n${text}`;

    const messages = [{ role: 'user', content: prompt }];
    let summary;
    try { summary = await callAnthropic(messages, null, null); }
    catch { summary = await callGemini(messages, null, null); }

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get chat histories
exports.getChatHistories = async (req, res) => {
  try {
    const histories = await ChatHistory.find({ user: req.user._id }).select('title createdAt').sort('-createdAt').limit(20);
    res.json({ success: true, histories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get single chat history
exports.getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!history) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, history });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

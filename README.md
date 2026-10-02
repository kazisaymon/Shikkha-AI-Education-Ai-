<<<<<<< HEAD
# 🎓 শিক্ষা AI- Bangladesh Learning Platform
<<<<<<<<HEAD
# Live link;https://shikkha-ai-education-ai.vercel.app/

## Features
- ✅ **Entry Screen → Login** (Ostad app style, role select first)
- ✅ **Forgot Password / Reset Password**
- ✅ **Student**: Course browse, MCQ Tests (unit/exam/mock/practice), Results, Class Materials, AI Chat
- ✅ **Teacher**: My Courses, Tests, Class Materials (note/recording/file/video), AI Chat
- ✅ **Admin Panel**: Full user/course/test management, stats dashboard
- ✅ **AI Chatbot**: Claude (Anthropic) → Gemini fallback, image support, chat history
- ✅ **Bilingual**: বাংলা + English full support

---

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- At least one AI API key (Anthropic or Gemini)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 4. .env Configuration (backend)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/shikkha_ai_v3
JWT_SECRET=any_random_secret_key_here

# At least one AI key required:
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

CLIENT_URL=http://localhost:3000
```

### 5. Create Admin Account
Register normally, then in MongoDB set `role: "admin"` for your user.
OR use the register page with role "Admin".

---

## 📁 Project Structure
```
shikkha-v3/
├── backend/
│   ├── controllers/   (auth, course, test, ai, admin)
│   ├── models/        (User, Course, Test, TestResult, ChatHistory)
│   ├── routes/        (auth, courses, tests, ai, admin)
│   ├── middleware/    (authMiddleware)
│   ├── utils/         (generateToken, sendEmail)
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Auth/       (Login, Register, ForgotReset)
        │   ├── Admin/      (AdminPanel)
        │   ├── Chatbot/    (ChatbotPage)
        │   ├── Common/     (Layout, ProtectedRoute)
        │   ├── Courses/    (CoursesPage)
        │   ├── Dashboard/  (Student, Teacher)
        │   ├── Materials/  (MaterialsPage)
        │   └── Tests/      (TestPage, TestsListPage, ResultsPage)
        ├── context/        (AuthContext)
        └── services/       (api.js)
```

## 🤖 AI Chatbot
- Primary: Anthropic Claude
- Fallback: Google Gemini 1.5 Flash
- If neither key is set, chatbot will show error message
- Supports image uploads for visual question answering

## 📝 Test Types
- **Unit Test** - ইউনিট পরীক্ষা
- **Exam** - পরীক্ষা  
- **Mock Test** - মক টেস্ট
- **Practice** - অনুশীলন

## 📂 Class Materials Types
- **Note** (📝) - ক্লাস নোট (text content)
- **Recording** (🎥) - রেকর্ডিং (video + file URL)
- **File** (📂) - ফাইল (Google Drive, etc.)
- **Video** (▶️) - ভিডিও (YouTube, etc.)
=======
# Shikkha-AI-Education-Ai-
>>>>>>> 58231c9b12cef13a4a60e4712103cd64468bf130

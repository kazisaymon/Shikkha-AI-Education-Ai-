import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Common/Layout';

// Auth
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './components/Auth/ForgotResetPage';

// Dashboards
import StudentDashboard from './components/Dashboard/StudentDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import AdminPanel from './components/Admin/AdminPanel';

// Shared pages
import CoursesPage from './components/Courses/CoursesPage';
import CourseFormPage from './components/Courses/CourseFormPage';
import TestsListPage from './components/Tests/TestsListPage';
import TestFormPage from './components/Tests/TestFormPage';
import TestPage from './components/Tests/TestPage';
import ResultsPage from './components/Tests/ResultsPage';
import MaterialsPage from './components/Materials/MaterialsPage';
import ChatbotPage from './components/Chatbot/ChatbotPage';

function StudentLayout({ children }) {
  return <Layout role="student">{children}</Layout>;
}
function TeacherLayout({ children }) {
  return <Layout role="teacher">{children}</Layout>;
}
function AdminLayout({ children }) {
  return <Layout role="admin">{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: 12, fontFamily: 'inherit', fontSize: 14, fontWeight: 600 } }} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><CoursesPage role="student" /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/tests" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><TestsListPage role="student" /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/tests/:id" element={<ProtectedRoute allowedRoles={['student']}><TestPage /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><ResultsPage /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/materials" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><MaterialsPage role="student" /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/ai" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><ChatbotPage /></StudentLayout></ProtectedRoute>} />

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherDashboard /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><CoursesPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/courses/new" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><CourseFormPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/courses/:id/edit" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><CourseFormPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TestsListPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/tests/new" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TestFormPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/tests/:id/edit" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TestFormPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/materials" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><MaterialsPage role="teacher" /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><div style={{padding:28}}><h2>👥 শিক্ষার্থী তালিকা (শীঘ্রই আসছে)</h2></div></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher/ai" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><ChatbotPage /></TeacherLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPanel /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPanel /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><CoursesPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/courses/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><CourseFormPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/courses/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><CourseFormPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TestsListPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tests/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TestFormPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tests/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TestFormPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/materials" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><MaterialsPage role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/ai" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ChatbotPage /></AdminLayout></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

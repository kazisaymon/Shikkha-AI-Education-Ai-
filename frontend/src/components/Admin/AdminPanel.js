import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, courseAPI, testAPI } from '../../services/api';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 18, padding: '28px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#fee2e2', border: 'none', color: R, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { language } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Forms
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [courseForm, setCourseForm] = useState({ title: '', titleBn: '', description: '', category: 'other', level: 'beginner', isPublished: false });
  const [testForm, setTestForm] = useState({ title: '', titleBn: '', type: 'unit', subject: 'general', duration: 30, isPublished: false, questions: [] });
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, c, t] = await Promise.all([
        adminAPI.getStats(), adminAPI.getUsers(), courseAPI.getAllAdmin(), testAPI.getAllAdmin()
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users || []);
      setCourses(c.data.courses || []);
      setTests(t.data.tests || []);
    } catch (e) { toast.error('লোড ব্যর্থ'); }
    finally { setLoading(false); }
  };

  // User actions
  const handleCreateUser = async () => {
    try {
      await adminAPI.createUser(userForm);
      toast.success('ব্যবহারকারী তৈরি হয়েছে');
      setModal(null); setUserForm({ name: '', email: '', password: '', role: 'student' });
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'ব্যর্থ'); }
  };

  const handleUpdateUserRole = async (id, role) => {
    try { await adminAPI.updateUser(id, { role }); toast.success('আপডেট সফল'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  const handleToggleUser = async (id, isActive) => {
    try { await adminAPI.updateUser(id, { isActive: !isActive }); toast.success('আপডেট সফল'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('সত্যিই মুছবেন?')) return;
    try { await adminAPI.deleteUser(id); toast.success('মুছে ফেলা হয়েছে'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  // Course actions
  const handleCreateCourse = async () => {
    try {
      await courseAPI.create(courseForm);
      toast.success('কোর্স তৈরি হয়েছে');
      setModal(null); setCourseForm({ title: '', titleBn: '', description: '', category: 'other', level: 'beginner', isPublished: false });
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'ব্যর্থ'); }
  };

  const handleToggleCourse = async (id, isPublished) => {
    try { await courseAPI.update(id, { isPublished: !isPublished }); toast.success('আপডেট সফল'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('সত্যিই মুছবেন?')) return;
    try { await courseAPI.delete(id); toast.success('মুছে ফেলা হয়েছে'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  // Test/Question
  const addQuestion = () => {
    if (!qForm.question || qForm.options.some(o => !o)) return toast.error('সব ঘর পূরণ করুন');
    setTestForm(f => ({ ...f, questions: [...f.questions, { ...qForm }] }));
    setQForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 });
  };

  const handleCreateTest = async () => {
    if (!testForm.title) return toast.error('শিরোনাম দিন');
    if (testForm.questions.length === 0) return toast.error('কমপক্ষে একটি প্রশ্ন যোগ করুন');
    try {
      await testAPI.create(testForm);
      toast.success('পরীক্ষা তৈরি হয়েছে');
      setModal(null); setTestForm({ title: '', titleBn: '', type: 'unit', subject: 'general', duration: 30, isPublished: false, questions: [] });
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'ব্যর্থ'); }
  };

  const handleToggleTest = async (id, isPublished) => {
    try { await testAPI.update(id, { isPublished: !isPublished }); toast.success('আপডেট সফল'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('সত্যিই মুছবেন?')) return;
    try { await testAPI.delete(id); toast.success('মুছে ফেলা হয়েছে'); loadAll(); }
    catch { toast.error('ব্যর্থ'); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const input = (val, onChange, props = {}) => (
    <input value={val} onChange={e => onChange(e.target.value)} {...props}
      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, ...(props.style || {}) }}
      onFocus={e => e.target.style.borderColor = G} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
  );

  const sel = (val, onChange, opts) => (
    <select value={val} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, background: 'white' }}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  const tabs = [
    { id: 'dashboard', label: '📊 ড্যাশবোর্ড' },
    { id: 'users', label: '👥 ব্যবহারকারী' },
    { id: 'courses', label: '📚 কোর্স' },
    { id: 'tests', label: '📝 পরীক্ষা' },
  ];

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1e293b, #334155)`, borderRadius: 18, padding: '24px 28px', marginBottom: 24, color: 'white' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>⚙️ অ্যাডমিন প্যানেল</h2>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>সমস্ত কার্যক্রম পরিচালনা করুন</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '10px 20px', borderRadius: 10, border: `2px solid ${tab === id ? G : '#e5e7eb'}`, background: tab === id ? G : 'white', color: tab === id ? 'white' : '#444', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', color: G, padding: 40 }}>⏳ লোড হচ্ছে...</div>}

      {/* Dashboard */}
      {!loading && tab === 'dashboard' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { icon: '👥', val: stats.totalUsers, label: 'মোট ব্যবহারকারী', color: '#3b82f6' },
              { icon: '📚', val: stats.totalCourses, label: 'মোট কোর্স', color: G },
              { icon: '📝', val: stats.totalTests, label: 'মোট পরীক্ষা', color: '#8b5cf6' },
              { icon: '📊', val: stats.totalResults, label: 'মোট ফলাফল', color: '#f59e0b' },
            ].map(({ icon, val, label, color }) => (
              <div key={label} style={{ background: 'white', borderRadius: 14, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`, textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>{icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color, marginTop: 8 }}>{val}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 800 }}>👥 ভূমিকা অনুযায়ী ব্যবহারকারী</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {(stats.roleStats || []).map(({ _id, count }) => (
                <div key={_id} style={{ padding: '16px 24px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e5e7eb', textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{_id === 'admin' ? '⚙️' : _id === 'teacher' ? '👨‍🏫' : '🎓'}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: G }}>{count}</div>
                  <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginTop: 2 }}>{_id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {!loading && tab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <input placeholder="🔍 নাম বা ইমেইল খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none' }} />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, background: 'white', outline: 'none' }}>
              <option value="">সব ভূমিকা</option>
              <option value="student">শিক্ষার্থী</option>
              <option value="teacher">শিক্ষক</option>
              <option value="admin">অ্যাডমিন</option>
            </select>
            <button onClick={() => setModal('createUser')}
              style={{ padding: '10px 20px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              + নতুন ব্যবহারকারী
            </button>
          </div>
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['নাম', 'ইমেইল', 'ভূমিকা', 'যাচাই', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#666' }}>{u.email}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <select value={u.role} onChange={e => handleUpdateUserRole(u._id, e.target.value)}
                        style={{ padding: '4px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: 'white', cursor: 'pointer' }}>
                        <option value="student">🎓 শিক্ষার্থী</option>
                        <option value="teacher">👨‍🏫 শিক্ষক</option>
                        <option value="admin">⚙️ অ্যাডমিন</option>
                      </select>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: u.isVerified ? '#d1fae5' : '#fef3c7', color: u.isVerified ? '#065f46' : '#92400e', fontWeight: 700 }}>
                        {u.isVerified ? '✅ হ্যাঁ' : '⏳ না'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <button onClick={() => handleToggleUser(u._id, u.isActive)}
                        style={{ fontSize: 11, padding: '4px 12px', borderRadius: 10, border: 'none', background: u.isActive ? '#d1fae5' : '#fee2e2', color: u.isActive ? '#065f46' : '#991b1b', fontWeight: 700, cursor: 'pointer' }}>
                        {u.isActive ? '✅ সক্রিয়' : '❌ নিষ্ক্রিয়'}
                      </button>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <button onClick={() => handleDeleteUser(u._id)}
                        style={{ padding: '5px 12px', background: '#fee2e2', color: R, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        🗑 মুছুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>কোনো ব্যবহারকারী পাওয়া যায়নি</p>}
          </div>
        </div>
      )}

      {/* Courses */}
      {!loading && tab === 'courses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
            <button onClick={() => setModal('createCourse')}
              style={{ padding: '10px 20px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              + নতুন কোর্স
            </button>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {courses.map(c => (
              <div key={c._id} style={{ background: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{c.titleBn || c.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    👨‍🏫 {c.teacher?.name} · 👥 {c.enrolledStudents?.length || 0} · 📂 {c.category} · {c.level}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => handleToggleCourse(c._id, c.isPublished)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: c.isPublished ? '#fef3c7' : '#d1fae5', color: c.isPublished ? '#92400e' : '#065f46', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {c.isPublished ? '⏸ আনপাবলিশ' : '✅ পাবলিশ'}
                  </button>
                  <button onClick={() => handleDeleteCourse(c._id)}
                    style={{ padding: '6px 14px', background: '#fee2e2', color: R, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>কোনো কোর্স নেই</p>}
          </div>
        </div>
      )}

      {/* Tests */}
      {!loading && tab === 'tests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
            <button onClick={() => setModal('createTest')}
              style={{ padding: '10px 20px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              + নতুন পরীক্ষা
            </button>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {tests.map(t => (
              <div key={t._id} style={{ background: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{t.titleBn || t.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 10, fontWeight: 600, marginRight: 8 }}>{t.type}</span>
                    📌 {t.subject} · ❓ {t.questions?.length || 0} প্রশ্ন · ⏱ {t.duration} min · 👤 {t.createdBy?.name}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => handleToggleTest(t._id, t.isPublished)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: t.isPublished ? '#fef3c7' : '#d1fae5', color: t.isPublished ? '#92400e' : '#065f46', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {t.isPublished ? '⏸ আনপাবলিশ' : '✅ পাবলিশ'}
                  </button>
                  <button onClick={() => handleDeleteTest(t._id)}
                    style={{ padding: '6px 14px', background: '#fee2e2', color: R, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {tests.length === 0 && <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>কোনো পরীক্ষা নেই</p>}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === 'createUser' && (
        <Modal title="নতুন ব্যবহারকারী তৈরি করুন" onClose={() => setModal(null)}>
          {input(userForm.name, v => setUserForm(f => ({ ...f, name: v })), { placeholder: 'পূর্ণ নাম' })}
          {input(userForm.email, v => setUserForm(f => ({ ...f, email: v })), { placeholder: 'ইমেইল', type: 'email' })}
          {input(userForm.password, v => setUserForm(f => ({ ...f, password: v })), { placeholder: 'পাসওয়ার্ড', type: 'password' })}
          {sel(userForm.role, v => setUserForm(f => ({ ...f, role: v })), [['student', '🎓 শিক্ষার্থী'], ['teacher', '👨‍🏫 শিক্ষক'], ['admin', '⚙️ অ্যাডমিন']])}
          <button onClick={handleCreateUser} style={{ width: '100%', padding: '12px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>✅ তৈরি করুন</button>
        </Modal>
      )}

      {modal === 'createCourse' && (
        <Modal title="নতুন কোর্স তৈরি করুন" onClose={() => setModal(null)}>
          {input(courseForm.title, v => setCourseForm(f => ({ ...f, title: v })), { placeholder: 'Course Title (English)' })}
          {input(courseForm.titleBn, v => setCourseForm(f => ({ ...f, titleBn: v })), { placeholder: 'কোর্সের শিরোনাম (বাংলা)' })}
          <textarea placeholder="বিবরণ..." value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, resize: 'vertical' }} />
          {sel(courseForm.category, v => setCourseForm(f => ({ ...f, category: v })), [['math', 'গণিত'], ['science', 'বিজ্ঞান'], ['language', 'ভাষা'], ['computer', 'কম্পিউটার'], ['hsc', 'HSC'], ['ssc', 'SSC'], ['jsc', 'JSC'], ['other', 'অন্যান্য']])}
          {sel(courseForm.level, v => setCourseForm(f => ({ ...f, level: v })), [['beginner', 'শিক্ষানবিস'], ['intermediate', 'মধ্যবর্তী'], ['advanced', 'উন্নত']])}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={courseForm.isPublished} onChange={e => setCourseForm(f => ({ ...f, isPublished: e.target.checked }))} />
            এখনই প্রকাশ করুন
          </label>
          <button onClick={handleCreateCourse} style={{ width: '100%', padding: '12px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>✅ কোর্স তৈরি করুন</button>
        </Modal>
      )}

      {modal === 'createTest' && (
        <Modal title="নতুন পরীক্ষা তৈরি করুন" onClose={() => setModal(null)}>
          {input(testForm.title, v => setTestForm(f => ({ ...f, title: v })), { placeholder: 'Test Title (English)' })}
          {input(testForm.titleBn, v => setTestForm(f => ({ ...f, titleBn: v })), { placeholder: 'পরীক্ষার শিরোনাম (বাংলা)' })}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {sel(testForm.type, v => setTestForm(f => ({ ...f, type: v })), [['unit', 'ইউনিট টেস্ট'], ['exam', 'পরীক্ষা'], ['mock', 'মক টেস্ট'], ['practice', 'অনুশীলন']])}
            {input(testForm.subject, v => setTestForm(f => ({ ...f, subject: v })), { placeholder: 'বিষয় (যেমন: Math)' })}
          </div>
          {input(testForm.duration, v => setTestForm(f => ({ ...f, duration: parseInt(v) || 30 })), { placeholder: 'সময় (মিনিট)', type: 'number' })}

          {/* Add Questions */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#333' }}>প্রশ্ন যোগ করুন ({testForm.questions.length} টি)</div>
            {input(qForm.question, v => setQForm(f => ({ ...f, question: v })), { placeholder: 'প্রশ্ন লিখুন...' })}
            {qForm.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input type="radio" checked={qForm.correctAnswer === i} onChange={() => setQForm(f => ({ ...f, correctAnswer: i }))} style={{ cursor: 'pointer' }} />
                <input value={opt} onChange={e => { const o = [...qForm.options]; o[i] = e.target.value; setQForm(f => ({ ...f, options: o })); }}
                  placeholder={`বিকল্প ${i + 1} (সঠিকটিতে রেডিও নির্বাচন করুন)`}
                  style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${qForm.correctAnswer === i ? G : '#e5e7eb'}`, borderRadius: 8, fontSize: 13, outline: 'none' }} />
              </div>
            ))}
            <button onClick={addQuestion}
              style={{ width: '100%', padding: '9px', background: '#e6f4f0', color: G, border: `1.5px solid ${G}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
              + প্রশ্ন যোগ করুন
            </button>
            {testForm.questions.length > 0 && (
              <div style={{ marginTop: 10, maxHeight: 120, overflowY: 'auto' }}>
                {testForm.questions.map((q, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#555', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                    {i + 1}. {q.question.slice(0, 60)}...
                    <button onClick={() => setTestForm(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }))}
                      style={{ marginLeft: 8, background: 'none', border: 'none', color: R, cursor: 'pointer', fontSize: 14 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={testForm.isPublished} onChange={e => setTestForm(f => ({ ...f, isPublished: e.target.checked }))} />
            এখনই প্রকাশ করুন
          </label>
          <button onClick={handleCreateTest} style={{ width: '100%', padding: '12px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            ✅ পরীক্ষা তৈরি করুন ({testForm.questions.length} প্রশ্ন)
          </button>
        </Modal>
      )}
    </div>
  );
}

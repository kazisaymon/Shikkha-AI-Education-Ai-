import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, testAPI } from '../../services/api';

const G = '#006A4E', R = '#F42A41';

export default function TeacherDashboard() {
  const { user, language } = useAuth();
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courseAPI.getMyCourses().catch(() => ({ data: { courses: [] } })),
      testAPI.getAllAdmin().catch(() => ({ data: { tests: [] } })),
    ]).then(([c, t]) => {
      setCourses(c.data.courses || []);
      setTests((t.data.tests || []).filter(t => t.createdBy?._id === user?._id || t.createdBy === user?._id));
    }).finally(() => setLoading(false));
  }, [user]);

  const totalStudents = courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0);

  const stats = [
    { icon: '📚', value: courses.length, label: language === 'bn' ? 'মোট কোর্স' : 'Total Courses', color: '#3b82f6' },
    { icon: '📝', value: tests.length, label: language === 'bn' ? 'মোট পরীক্ষা' : 'Total Tests', color: '#8b5cf6' },
    { icon: '👥', value: totalStudents, label: language === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Students', color: G },
    { icon: '✅', value: courses.filter(c => c.isPublished).length, label: language === 'bn' ? 'প্রকাশিত কোর্স' : 'Published', color: '#f59e0b' },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: G }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ background: `linear-gradient(135deg, #1e40af, #3b82f6)`, borderRadius: 18, padding: '28px 32px', marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px' }}>
          👨‍🏫 {language === 'bn' ? `আস্সালামু আলাইকুম, ${user?.name}!` : `Hello, ${user?.name}!`}
        </h2>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>
          {language === 'bn' ? 'আপনার কোর্স ও পরীক্ষা পরিচালনা করুন।' : 'Manage your courses and tests.'}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Link to="/teacher/courses" style={{ padding: '9px 20px', background: 'white', color: '#1e40af', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 800 }}>
            📚 {language === 'bn' ? 'কোর্স পরিচালনা' : 'Manage Courses'}
          </Link>
          <Link to="/teacher/tests" style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            📝 {language === 'bn' ? 'পরীক্ষা তৈরি করুন' : 'Create Test'}
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(({ icon, value, label, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>📚 {language === 'bn' ? 'আমার কোর্সসমূহ' : 'My Courses'}</h3>
            <Link to="/teacher/courses" style={{ fontSize: 12, color: G, fontWeight: 700, textDecoration: 'none' }}>+ {language === 'bn' ? 'নতুন' : 'New'}</Link>
          </div>
          {courses.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              {language === 'bn' ? 'কোনো কোর্স নেই। নতুন কোর্স তৈরি করুন।' : 'No courses yet.'}
            </p>
          ) : courses.slice(0, 5).map(c => (
            <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{language === 'bn' && c.titleBn ? c.titleBn : c.title}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>👥 {c.enrolledStudents?.length || 0} শিক্ষার্থী</div>
              </div>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, background: c.isPublished ? '#d1fae5' : '#fee2e2', color: c.isPublished ? '#065f46' : '#991b1b', fontWeight: 700 }}>
                {c.isPublished ? '✅ প্রকাশিত' : '⏸ খসড়া'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>📝 {language === 'bn' ? 'আমার পরীক্ষাসমূহ' : 'My Tests'}</h3>
            <Link to="/teacher/tests" style={{ fontSize: 12, color: G, fontWeight: 700, textDecoration: 'none' }}>+ {language === 'bn' ? 'নতুন' : 'New'}</Link>
          </div>
          {tests.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              {language === 'bn' ? 'কোনো পরীক্ষা নেই।' : 'No tests yet.'}
            </p>
          ) : tests.slice(0, 5).map(t => (
            <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{language === 'bn' && t.titleBn ? t.titleBn : t.title}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{t.type}</span>
                  {' · '}{t.questions?.length || 0} প্রশ্ন
                </div>
              </div>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, background: t.isPublished ? '#d1fae5' : '#fee2e2', color: t.isPublished ? '#065f46' : '#991b1b', fontWeight: 700 }}>
                {t.isPublished ? '✅' : '⏸'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

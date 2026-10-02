import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, testAPI } from '../../services/api';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

export default function StudentDashboard() {
  const { user, language } = useAuth();
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courseAPI.getAll().catch(() => ({ data: { courses: [] } })),
      testAPI.getAll().catch(() => ({ data: { tests: [] } })),
      testAPI.getMyResults().catch(() => ({ data: { results: [] } })),
    ]).then(([c, t, r]) => {
      setCourses(c.data.courses || []);
      setTests(t.data.tests || []);
      setResults(r.data.results || []);
    }).finally(() => setLoading(false));
  }, []);

  const enrolled = courses.filter(c => c.enrolledStudents?.includes(user?._id));
  const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;

  const stats = [
    { icon:'📚', value: enrolled.length, label: language === 'bn' ? 'ভর্তি কোর্স' : 'Enrolled Courses', color:'#3b82f6' },
    { icon:'📝', value: results.length, label: language === 'bn' ? 'দেওয়া পরীক্ষা' : 'Tests Taken', color:'#8b5cf6' },
    { icon:'📊', value: `${avgScore}%`, label: language === 'bn' ? 'গড় স্কোর' : 'Avg Score', color: G },
    { icon:'🏆', value: results.filter(r => r.passed).length, label: language === 'bn' ? 'পাস করেছি' : 'Tests Passed', color:'#f59e0b' },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: G }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ background: `linear-gradient(135deg, ${G}, #00a876)`, borderRadius: 18, padding: '28px 32px', marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px' }}>
          👋 {language === 'bn' ? `আস্সালামু আলাইকুম, ${user?.name}!` : `Hello, ${user?.name}!`}
        </h2>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>
          {language === 'bn' ? 'আজকে কী শিখবেন? আপনার কোর্স ও পরীক্ষা দেখুন।' : "What will you learn today? Check your courses and tests."}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Link to="/student/courses" style={{ padding: '9px 20px', background: 'white', color: G, borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 800 }}>
            📚 {language === 'bn' ? 'কোর্স দেখুন' : 'Browse Courses'}
          </Link>
          <Link to="/student/tests" style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            📝 {language === 'bn' ? 'পরীক্ষা দিন' : 'Take a Test'}
          </Link>
        </div>
      </div>

      {/* Stats */}
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
        {/* Available Tests */}
        <div style={{ background: 'white', borderRadius: 16, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>📝 {language === 'bn' ? 'পরীক্ষাসমূহ' : 'Available Tests'}</h3>
            <Link to="/student/tests" style={{ fontSize: 12, color: G, fontWeight: 700, textDecoration: 'none' }}>{language === 'bn' ? 'সব দেখুন →' : 'See all →'}</Link>
          </div>
          {tests.slice(0, 4).length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>কোনো পরীক্ষা নেই</p>
          ) : tests.slice(0, 4).map(test => (
            <div key={test._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#222' }}>{language === 'bn' && test.titleBn ? test.titleBn : test.title}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 10, fontWeight: 600, marginRight: 6 }}>{test.type}</span>
                  ⏱ {test.duration} min
                </div>
              </div>
              <Link to={`/student/tests/${test._id}`} style={{ padding: '7px 14px', background: G, color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {language === 'bn' ? 'দিন' : 'Start'}
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Results */}
        <div style={{ background: 'white', borderRadius: 16, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>📊 {language === 'bn' ? 'সাম্প্রতিক ফলাফল' : 'Recent Results'}</h3>
            <Link to="/student/results" style={{ fontSize: 12, color: G, fontWeight: 700, textDecoration: 'none' }}>{language === 'bn' ? 'সব দেখুন →' : 'See all →'}</Link>
          </div>
          {results.slice(0, 4).length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>কোনো ফলাফল নেই</p>
          ) : results.slice(0, 4).map(r => (
            <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>{r.test?.titleBn || r.test?.title}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{r.score}/{r.totalMarks} marks</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: r.passed ? G : R }}>{r.percentage}%</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: r.passed ? G : R }}>{r.passed ? '✅ পাস' : '❌ ফেল'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

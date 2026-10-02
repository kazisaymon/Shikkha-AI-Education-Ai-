import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E';
const TYPE_COLORS = { unit: '#ede9fe|#7c3aed', exam: '#fee2e2|#991b1b', mock: '#fef3c7|#92400e', practice: '#d1fae5|#065f46' };

export default function TestsListPage({ role = 'student' }) {
  const { language } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fn = role === 'student' ? testAPI.getAll() : testAPI.getAllAdmin();
    fn.then(({ data }) => setTests(data.tests || [])).catch(() => toast.error('লোড ব্যর্থ')).finally(() => setLoading(false));
  }, [role]);

  const handleDelete = async (id) => {
    if (!window.confirm('মুছবেন?')) return;
    await testAPI.delete(id);
    setTests(t => t.filter(x => x._id !== id));
    toast.success('মুছে ফেলা হয়েছে');
  };

  const handleToggle = async (id, isPublished) => {
    await testAPI.update(id, { isPublished: !isPublished });
    setTests(t => t.map(x => x._id === id ? { ...x, isPublished: !isPublished } : x));
    toast.success('আপডেট সফল');
  };

  const types = ['all', 'unit', 'exam', 'mock', 'practice'];
  const filtered = filter === 'all' ? tests : tests.filter(t => t.type === filter);

  return (
    <div style={{ padding: 28, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>📝 {language === 'bn' ? 'পরীক্ষাসমূহ' : 'Tests'}</h2>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{filtered.length} টি পরীক্ষা পাওয়া গেছে</p>
        </div>
        {(role === 'teacher' || role === 'admin') && (
          <Link to={`/${role}/tests/new`} style={{ padding: '10px 20px', background: G, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>+ নতুন পরীক্ষা</Link>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '8px 18px', borderRadius: 20, border: `2px solid ${filter === t ? G : '#e5e7eb'}`, background: filter === t ? G : 'white', color: filter === t ? 'white' : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {t === 'all' ? 'সব' : t === 'unit' ? 'ইউনিট টেস্ট' : t === 'exam' ? 'পরীক্ষা' : t === 'mock' ? 'মক টেস্ট' : 'অনুশীলন'}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', color: G, padding: 40 }}>⏳ লোড হচ্ছে...</div>}

      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map(test => {
          const [bg, color] = (TYPE_COLORS[test.type] || '#f3f4f6|#555').split('|');
          return (
            <div key={test._id} style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: bg, color, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{test.type?.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>📌 {test.subject}</span>
                  {!test.isPublished && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>খসড়া</span>}
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800 }}>{language === 'bn' && test.titleBn ? test.titleBn : test.title}</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
                  <span>❓ {test.questions?.length || 0} প্রশ্ন</span>
                  <span>⏱ {test.duration} মিনিট</span>
                  <span>🏆 {test.totalMarks} নম্বর</span>
                  <span>✅ পাস: {test.passingMarks}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                {role === 'student' && test.isPublished && (
                  <Link to={`/student/tests/${test._id}`}
                    style={{ padding: '10px 20px', background: G, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    📝 পরীক্ষা দিন
                  </Link>
                )}
                {(role === 'teacher' || role === 'admin') && (
                  <>
                    <Link to={`/${role}/tests/${test._id}/edit`}
                      style={{ padding: '8px 14px', background: '#eff6ff', color: '#3b82f6', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      ✏️ সম্পাদনা
                    </Link>
                    <button onClick={() => handleToggle(test._id, test.isPublished)}
                      style={{ padding: '8px 14px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {test.isPublished ? '⏸' : '✅'}
                    </button>
                    <button onClick={() => handleDelete(test._id)}
                      style={{ padding: '8px 14px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      🗑 মুছুন
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>কোনো পরীক্ষা পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}

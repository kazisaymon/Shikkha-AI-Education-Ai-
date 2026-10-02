import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E';
const CATS = [['all','সব'],['math','গণিত'],['science','বিজ্ঞান'],['language','ভাষা'],['computer','কম্পিউটার'],['hsc','HSC'],['ssc','SSC'],['jsc','JSC']];

export default function CoursesPage({ role = 'student' }) {
  const { language } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fn = role === 'teacher' ? courseAPI.getMyCourses() : role === 'admin' ? courseAPI.getAllAdmin() : courseAPI.getAll({ category: cat !== 'all' ? cat : undefined, search: search || undefined });
    fn.then(({ data }) => setCourses(data.courses || [])).finally(() => setLoading(false));
  }, [role, cat, search]);

  const handleEnroll = async (id) => {
    try { await courseAPI.enroll(id); toast.success('ভর্তি সফল! 🎉'); }
    catch (e) { toast.error(e.response?.data?.message || 'ব্যর্থ'); }
  };

  const handleToggle = async (id, isPublished) => {
    await courseAPI.update(id, { isPublished: !isPublished });
    setCourses(c => c.map(x => x._id === id ? { ...x, isPublished: !isPublished } : x));
    toast.success('আপডেট সফল');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('মুছবেন?')) return;
    await courseAPI.delete(id);
    setCourses(c => c.filter(x => x._id !== id));
    toast.success('মুছে ফেলা হয়েছে');
  };

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>📚 {language === 'bn' ? 'কোর্সসমূহ' : 'Courses'}</h2>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{courses.length} টি কোর্স</p>
        </div>
        {(role === 'teacher' || role === 'admin') && (
          <Link to={`/${role}/courses/new`} style={{ padding: '10px 20px', background: G, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>+ নতুন কোর্স</Link>
        )}
      </div>

      {role === 'student' && (
        <>
          <input placeholder="🔍 কোর্স খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
            {CATS.map(([v, l]) => (
              <button key={v} onClick={() => setCat(v)}
                style={{ padding: '7px 16px', borderRadius: 20, border: `2px solid ${cat === v ? G : '#e5e7eb'}`, background: cat === v ? G : 'white', color: cat === v ? 'white' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}

      {loading && <div style={{ textAlign: 'center', color: G, padding: 40 }}>⏳ লোড হচ্ছে...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
        {courses.map(c => (
          <div key={c._id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.2s', cursor: 'default' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ height: 10, background: `linear-gradient(90deg,${G},#00a876)` }} />
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ background: '#e6f4f0', color: G, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.category || 'general'}</span>
                {!c.isPublished && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>খসড়া</span>}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{language === 'bn' && c.titleBn ? c.titleBn : c.title}</h3>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#666', lineHeight: 1.5 }}>{c.description?.slice(0, 80) || c.descriptionBn?.slice(0, 80)}{c.description?.length > 80 ? '...' : ''}</p>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#aaa', marginBottom: 16 }}>
                <span>👨‍🏫 {c.teacher?.name || 'শিক্ষক'}</span>
                <span>👥 {c.enrolledStudents?.length || 0}</span>
                <span>📊 {c.level}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {role === 'student' && (
                  <button onClick={() => handleEnroll(c._id)}
                    style={{ flex: 1, padding: '10px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    ✅ ভর্তি হন
                  </button>
                )}
                <Link to={`/${role}/materials`} style={{ flex: 1, padding: '10px', background: '#f0faf6', color: G, border: `1.5px solid #c6e8dd`, borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                  📂 ম্যাটেরিয়াল
                </Link>
                {(role === 'teacher' || role === 'admin') && (
                  <>
                    <Link to={`/${role}/courses/${c._id}/edit`}
                      style={{ padding: '10px 12px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      ✏️
                    </Link>
                    <button onClick={() => handleToggle(c._id, c.isPublished)}
                      style={{ padding: '10px 12px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {c.isPublished ? '⏸' : '✅'}
                    </button>
                    <button onClick={() => handleDelete(c._id)}
                      style={{ padding: '10px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>কোনো কোর্স পাওয়া যায়নি</p>
        </div>
      )}
    </div>
  );
}

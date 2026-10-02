import React, { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';
const TYPE_INFO = {
  note:      { icon: '📝', label: 'ক্লাস নোট', color: '#3b82f6', bg: '#eff6ff' },
  recording: { icon: '🎥', label: 'রেকর্ডিং', color: '#8b5cf6', bg: '#f5f3ff' },
  file:      { icon: '📂', label: 'ফাইল', color: '#f59e0b', bg: '#fffbeb' },
  video:     { icon: '▶️', label: 'ভিডিও', color: R, bg: '#fff5f5' },
};

function AddMaterialModal({ courseId, onClose, onSuccess }) {
  const [form, setForm] = useState({ type: 'note', title: '', titleBn: '', description: '', fileUrl: '', videoUrl: '', content: '', week: 1 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title) return toast.error('শিরোনাম দিন');
    setLoading(true);
    try {
      await courseAPI.addMaterial(courseId, form);
      toast.success('ম্যাটেরিয়াল যোগ করা হয়েছে!');
      onSuccess();
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'ব্যর্থ'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 18, padding: '28px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📂 নতুন ম্যাটেরিয়াল যোগ করুন</h3>
          <button onClick={onClose} style={{ background: '#fee2e2', border: 'none', color: R, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        {/* Type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
          {Object.entries(TYPE_INFO).map(([k, { icon, label, color, bg }]) => (
            <div key={k} onClick={() => setForm(f => ({ ...f, type: k }))}
              style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 12, border: `2px solid ${form.type === k ? color : '#e5e7eb'}`, background: form.type === k ? bg : '#fafafa', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: form.type === k ? color : '#888', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {[
          { key: 'title', label: 'শিরোনাম (English)', ph: 'Title' },
          { key: 'titleBn', label: 'শিরোনাম (বাংলা)', ph: 'শিরোনাম' },
          { key: 'description', label: 'বিবরণ', ph: 'সংক্ষিপ্ত বিবরণ' },
        ].map(({ key, label, ph }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>{label}</label>
            <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = G} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
        ))}

        {(form.type === 'note') && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>নোটের বিষয়বস্তু</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="নোট এখানে লিখুন..." rows={5}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
        )}

        {(form.type === 'file' || form.type === 'recording') && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>ফাইল URL</label>
            <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://drive.google.com/..."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        {(form.type === 'video' || form.type === 'recording') && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>ভিডিও URL (YouTube/Drive)</label>
            <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/..."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>সপ্তাহ নম্বর</label>
          <input type="number" min="1" value={form.week} onChange={e => setForm(f => ({ ...f, week: parseInt(e.target.value) || 1 }))}
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '12px', background: loading ? '#9ca3af' : G, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ যোগ হচ্ছে...' : '✅ ম্যাটেরিয়াল যোগ করুন'}
        </button>
      </div>
    </div>
  );
}

export default function MaterialsPage({ role = 'student' }) {
  const { language } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fn = role === 'student' ? courseAPI.getAll() : courseAPI.getMyCourses();
    fn.then(({ data }) => {
      const c = data.courses || [];
      setCourses(c);
      if (c.length > 0) setSelectedCourse(c[0]);
    }).finally(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    if (!selectedCourse?._id) return;
    setLoading(true);
    courseAPI.getOne(selectedCourse._id).then(({ data }) => {
      setMaterials(data.course.classMaterials || []);
      setSelectedCourse(data.course);
    }).finally(() => setLoading(false));
  }, [selectedCourse?._id]);

  const handleDelete = async (matId) => {
    if (!window.confirm('মুছবেন?')) return;
    await courseAPI.deleteMaterial(selectedCourse._id, matId);
    setMaterials(m => m.filter(x => x._id !== matId));
    toast.success('মুছে ফেলা হয়েছে');
  };

  const filtered = typeFilter === 'all' ? materials : materials.filter(m => m.type === typeFilter);

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>📂 {language === 'bn' ? 'ক্লাস ম্যাটেরিয়াল' : 'Class Materials'}</h2>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>ক্লাস নোট, রেকর্ডিং ও ফাইল</p>
        </div>
        {(role === 'teacher' || role === 'admin') && selectedCourse && (
          <button onClick={() => setShowAddModal(true)}
            style={{ padding: '10px 20px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + ম্যাটেরিয়াল যোগ করুন
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Course list */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', height: 'fit-content' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 12 }}>📚 কোর্সসমূহ</div>
          {courses.map(c => (
            <div key={c._id} onClick={() => setSelectedCourse(c)}
              style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 6, background: selectedCourse?._id === c._id ? '#e6f4f0' : '#fafafa', border: `1.5px solid ${selectedCourse?._id === c._id ? G : '#f3f4f6'}`, transition: 'all 0.18s' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedCourse?._id === c._id ? G : '#333' }}>{language === 'bn' && c.titleBn ? c.titleBn : c.title}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{c.classMaterials?.length || 0} ম্যাটেরিয়াল</div>
            </div>
          ))}
          {courses.length === 0 && !loading && <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>কোনো কোর্স নেই</p>}
        </div>

        {/* Materials */}
        <div>
          {/* Type filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {['all', 'note', 'recording', 'file', 'video'].map(t => {
              const info = TYPE_INFO[t];
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ padding: '8px 16px', borderRadius: 20, border: `2px solid ${typeFilter === t ? (info?.color || G) : '#e5e7eb'}`, background: typeFilter === t ? (info?.bg || '#e6f4f0') : 'white', color: typeFilter === t ? (info?.color || G) : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {info ? `${info.icon} ${info.label}` : 'সব'}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {filtered.map(mat => {
              const info = TYPE_INFO[mat.type] || TYPE_INFO.file;
              return (
                <div key={mat._id} style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {info.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ background: info.bg, color: info.color, padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{info.label}</span>
                      <span style={{ fontSize: 11, color: '#aaa' }}>সপ্তাহ {mat.week}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800 }}>{language === 'bn' && mat.titleBn ? mat.titleBn : mat.title}</h4>
                    {mat.description && <p style={{ margin: '0 0 10px', fontSize: 13, color: '#666', lineHeight: 1.5 }}>{mat.description}</p>}
                    {mat.content && (
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 10, fontSize: 13, color: '#444', lineHeight: 1.7, maxHeight: 120, overflowY: 'auto' }}>
                        {mat.content}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {mat.videoUrl && (
                        <a href={mat.videoUrl} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '7px 16px', background: '#fee2e2', color: R, borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                          ▶️ ভিডিও দেখুন
                        </a>
                      )}
                      {mat.fileUrl && (
                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '7px 16px', background: '#eff6ff', color: '#3b82f6', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                          📥 ডাউনলোড
                        </a>
                      )}
                      {(role === 'teacher' || role === 'admin') && (
                        <button onClick={() => handleDelete(mat._id)}
                          style={{ padding: '7px 14px', background: '#fee2e2', color: R, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          🗑 মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>{new Date(mat.createdAt).toLocaleDateString('bn-BD')}</div>
                </div>
              );
            })}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa', background: 'white', borderRadius: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>কোনো ম্যাটেরিয়াল পাওয়া যায়নি</p>
                {(role === 'teacher' || role === 'admin') && <p style={{ fontSize: 13 }}>উপরে "ম্যাটেরিয়াল যোগ করুন" বাটন চাপুন</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && selectedCourse && (
        <AddMaterialModal courseId={selectedCourse._id} onClose={() => setShowAddModal(false)}
          onSuccess={() => courseAPI.getOne(selectedCourse._id).then(({ data }) => setMaterials(data.course.classMaterials || []))} />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E';
const CATS = ['math', 'science', 'language', 'computer', 'hsc', 'ssc', 'jsc', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 };

export default function CourseFormPage({ role = 'teacher' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', titleBn: '', description: '', descriptionBn: '',
    category: 'other', level: 'beginner', price: 0, thumbnail: '', isPublished: false,
  });

  useEffect(() => {
    if (!isEdit) return;
    courseAPI.getOne(id).then(({ data }) => {
      const c = data.course;
      setForm({
        title: c.title || '', titleBn: c.titleBn || '', description: c.description || '',
        descriptionBn: c.descriptionBn || '', category: c.category || 'other', level: c.level || 'beginner',
        price: c.price || 0, thumbnail: c.thumbnail || '', isPublished: c.isPublished || false,
      });
    }).catch(() => toast.error('কোর্স লোড ব্যর্থ')).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.titleBn) return toast.error('শিরোনাম (English ও বাংলা) দিন');
    setSaving(true);
    try {
      if (isEdit) {
        await courseAPI.update(id, form);
        toast.success('কোর্স আপডেট হয়েছে!');
      } else {
        await courseAPI.create(form);
        toast.success('কোর্স তৈরি হয়েছে! 🎉');
      }
      navigate(`/${role}/courses`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: G }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ padding: 28, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <button onClick={() => navigate(`/${role}/courses`)}
          style={{ background: '#f0faf6', border: '1px solid #c6e8dd', color: G, padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          ← {language === 'bn' ? 'ফিরে যান' : 'Back'}
        </button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
          {isEdit ? '✏️ কোর্স সম্পাদনা করুন' : '📚 নতুন কোর্স তৈরি করুন'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: 26, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>শিরোনাম (English) *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Course Title" required />
          </div>
          <div>
            <label style={labelStyle}>শিরোনাম (বাংলা) *</label>
            <input style={inputStyle} value={form.titleBn} onChange={e => handleChange('titleBn', e.target.value)} placeholder="কোর্সের শিরোনাম" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>বিবরণ (English)</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Course description" />
          </div>
          <div>
            <label style={labelStyle}>বিবরণ (বাংলা)</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} value={form.descriptionBn} onChange={e => handleChange('descriptionBn', e.target.value)} placeholder="কোর্সের বিবরণ" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>বিভাগ</label>
            <select style={inputStyle} value={form.category} onChange={e => handleChange('category', e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>স্তর</label>
            <select style={inputStyle} value={form.level} onChange={e => handleChange('level', e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>মূল্য (৳)</label>
            <input type="number" min="0" style={inputStyle} value={form.price} onChange={e => handleChange('price', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>থাম্বনেইল URL (ঐচ্ছিক)</label>
          <input style={inputStyle} value={form.thumbnail} onChange={e => handleChange('thumbnail', e.target.value)} placeholder="https://..." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
          <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => handleChange('isPublished', e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }} />
          <label htmlFor="isPublished" style={{ fontSize: 13, fontWeight: 700, color: '#444', cursor: 'pointer' }}>
            ✅ কোর্সটি প্রকাশ করুন (শিক্ষার্থীরা দেখতে পাবে)
          </label>
        </div>

        <button type="submit" disabled={saving}
          style={{ width: '100%', padding: '13px', background: saving ? '#9ca3af' : G, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '⏳ সংরক্ষণ হচ্ছে...' : isEdit ? '💾 আপডেট করুন' : '✅ কোর্স তৈরি করুন'}
        </button>
      </form>
    </div>
  );
}

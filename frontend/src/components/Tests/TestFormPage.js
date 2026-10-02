import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI, courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';
const TYPES = ['unit', 'exam', 'mock', 'practice'];

const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 };

const blankQuestion = () => ({
  question: '', questionBn: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  correctAnswer: 0, explanation: '', marks: 1,
});

export default function TestFormPage({ role = 'teacher' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '', titleBn: '', description: '', course: '', type: 'unit', subject: 'general',
    duration: 30, isPublished: false,
  });
  const [questions, setQuestions] = useState([blankQuestion()]);

  useEffect(() => {
    courseAPI.getMyCourses().then(({ data }) => setCourses(data.courses || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    testAPI.getOne(id).then(({ data }) => {
      const t = data.test;
      setForm({
        title: t.title || '', titleBn: t.titleBn || '', description: t.description || '',
        course: t.course || '', type: t.type || 'unit', subject: t.subject || 'general',
        duration: t.duration || 30, isPublished: t.isPublished || false,
      });
      setQuestions(t.questions?.length ? t.questions.map(q => ({
        ...q,
        options: q.options?.length ? q.options : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
      })) : [blankQuestion()]);
    }).catch(() => toast.error('পরীক্ষা লোড ব্যর্থ')).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const updateQuestion = (qIdx, key, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, [key]: value } : q));
  };
  const updateOption = (qIdx, oIdx, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? { ...o, text: value } : o) } : q));
  };
  const addQuestion = () => setQuestions(qs => [...qs, blankQuestion()]);
  const removeQuestion = (qIdx) => setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== qIdx) : qs);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('শিরোনাম দিন');
    for (const [i, q] of questions.entries()) {
      if (!q.question.trim()) return toast.error(`প্রশ্ন ${i + 1}: প্রশ্নের লেখা দিন`);
      if (q.options.some(o => !o.text.trim())) return toast.error(`প্রশ্ন ${i + 1}: সবগুলো অপশন পূরণ করুন`);
    }
    setSaving(true);
    try {
      const payload = { ...form, course: form.course || undefined, questions };
      if (isEdit) {
        await testAPI.update(id, payload);
        toast.success('পরীক্ষা আপডেট হয়েছে!');
      } else {
        await testAPI.create(payload);
        toast.success('পরীক্ষা তৈরি হয়েছে! 🎉');
      }
      navigate(`/${role}/tests`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: G }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ padding: 28, maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <button onClick={() => navigate(`/${role}/tests`)}
          style={{ background: '#f0faf6', border: '1px solid #c6e8dd', color: G, padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          ← {language === 'bn' ? 'ফিরে যান' : 'Back'}
        </button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
          {isEdit ? '✏️ পরীক্ষা সম্পাদনা করুন' : '📝 নতুন পরীক্ষা তৈরি করুন'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: 16, padding: 26, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>শিরোনাম (English) *</label>
              <input style={inputStyle} value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Test Title" required />
            </div>
            <div>
              <label style={labelStyle}>শিরোনাম (বাংলা)</label>
              <input style={inputStyle} value={form.titleBn} onChange={e => handleChange('titleBn', e.target.value)} placeholder="পরীক্ষার শিরোনাম" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>বিবরণ</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="সংক্ষিপ্ত বিবরণ" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>ধরন</label>
              <select style={inputStyle} value={form.type} onChange={e => handleChange('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>বিষয়</label>
              <input style={inputStyle} value={form.subject} onChange={e => handleChange('subject', e.target.value)} placeholder="general" />
            </div>
            <div>
              <label style={labelStyle}>সময় (মিনিট)</label>
              <input type="number" min="1" style={inputStyle} value={form.duration} onChange={e => handleChange('duration', parseInt(e.target.value) || 30)} />
            </div>
            <div>
              <label style={labelStyle}>কোর্স (ঐচ্ছিক)</label>
              <select style={inputStyle} value={form.course} onChange={e => handleChange('course', e.target.value)}>
                <option value="">— কোনটি নয় —</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
            <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => handleChange('isPublished', e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="isPublished" style={{ fontSize: 13, fontWeight: 700, color: '#444', cursor: 'pointer' }}>
              ✅ পরীক্ষাটি প্রকাশ করুন (শিক্ষার্থীরা দিতে পারবে)
            </label>
          </div>
        </div>

        {/* Questions */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>❓ প্রশ্নসমূহ ({questions.length})</h3>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: G }}>প্রশ্ন {qIdx + 1}</span>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIdx)}
                    style={{ background: '#fee2e2', color: R, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    🗑 মুছুন
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>প্রশ্ন (English) *</label>
                <input style={inputStyle} value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} placeholder="Question text" required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>প্রশ্ন (বাংলা)</label>
                <input style={inputStyle} value={q.questionBn} onChange={e => updateQuestion(qIdx, 'questionBn', e.target.value)} placeholder="প্রশ্ন (ঐচ্ছিক)" />
              </div>

              <label style={labelStyle}>অপশনসমূহ (সঠিক উত্তরে ক্লিক করুন) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button type="button" onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                        border: `2px solid ${q.correctAnswer === oIdx ? G : '#e5e7eb'}`,
                        background: q.correctAnswer === oIdx ? G : 'white',
                        color: q.correctAnswer === oIdx ? 'white' : '#888', fontSize: 12, fontWeight: 800,
                      }}>
                      {String.fromCharCode(65 + oIdx)}
                    </button>
                    <input style={inputStyle} value={opt.text} onChange={e => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} required />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
                <div>
                  <label style={labelStyle}>ব্যাখ্যা (ঐচ্ছিক)</label>
                  <input style={inputStyle} value={q.explanation} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} placeholder="সঠিক উত্তরের ব্যাখ্যা" />
                </div>
                <div>
                  <label style={labelStyle}>নম্বর</label>
                  <input type="number" min="1" style={inputStyle} value={q.marks} onChange={e => updateQuestion(qIdx, 'marks', parseInt(e.target.value) || 1)} />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion}
            style={{ width: '100%', padding: '12px', background: '#f0faf6', color: G, border: `1.5px dashed #c6e8dd`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + আরেকটি প্রশ্ন যোগ করুন
          </button>
        </div>

        <button type="submit" disabled={saving}
          style={{ width: '100%', padding: '13px', background: saving ? '#9ca3af' : G, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '⏳ সংরক্ষণ হচ্ছে...' : isEdit ? '💾 আপডেট করুন' : '✅ পরীক্ষা তৈরি করুন'}
        </button>
      </form>
    </div>
  );
}

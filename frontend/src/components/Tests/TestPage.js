import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

export default function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    testAPI.getOne(id).then(({ data }) => {
      setTest(data.test);
      setTimeLeft(data.test.duration * 60);
    }).catch(() => toast.error('পরীক্ষা পাওয়া যায়নি')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    const timeTaken = test.duration * 60 - timeLeft;
    const answerArr = Object.entries(answers).map(([qi, sel]) => ({ questionIndex: parseInt(qi), selectedAnswer: sel }));
    try {
      const { data } = await testAPI.submit(id, { answers: answerArr, timeTaken });
      setResult(data);
      setSubmitted(true);
      if (auto) toast('⏰ সময় শেষ! স্বয়ংক্রিয়ভাবে জমা হয়েছে।');
    } catch { toast.error('জমা ব্যর্থ'); }
    finally { setSubmitting(false); }
  }, [answers, id, submitting, test, timeLeft]);

  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) {
      if (started && timeLeft === 0 && !submitted) handleSubmit(true);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [started, submitted, timeLeft, handleSubmit]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const answered = Object.keys(answers).length;

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: G }}>⏳ লোড হচ্ছে...</div>;
  if (!test) return <div style={{ padding: 40, textAlign: 'center', color: R }}>পরীক্ষা পাওয়া যায়নি।</div>;

  // Start screen
  if (!started) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 8px' }}>{language === 'bn' && test.titleBn ? test.titleBn : test.title}</h2>
        <div style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 24 }}>{test.type?.toUpperCase()}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
          {[['❓', `${test.questions?.length} টি`, 'প্রশ্ন'], ['⏱', `${test.duration} মিনিট`, 'সময়'], ['🏆', `${test.totalMarks}`, 'মোট নম্বর'], ['✅', `${test.passingMarks}`, 'পাসিং নম্বর']].map(([i, v, l]) => (
            <div key={l} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 12px' }}>
              <div style={{ fontSize: 24 }}>{i}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: G, marginTop: 4 }}>{v}</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>একবার শুরু করলে সময় শেষ না হওয়া পর্যন্ত বা সব প্রশ্নের উত্তর না দেওয়া পর্যন্ত চলবে।</p>
        <button onClick={() => setStarted(true)}
          style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg,${G},#00a876)`, color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,106,78,0.35)' }}>
          🚀 পরীক্ষা শুরু করুন
        </button>
        <button onClick={() => navigate(-1)} style={{ marginTop: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14 }}>← ফিরে যান</button>
      </div>
    </div>
  );

  // Result screen
  if (submitted && result) {
    const r = result.result;
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', maxWidth: 500, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>{r.passed ? '🎉' : '😔'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: r.passed ? G : R, margin: '0 0 6px' }}>
            {r.passed ? 'অভিনন্দন! পাস করেছেন!' : 'আরো চেষ্টা করুন!'}
          </h2>
          <div style={{ fontSize: 64, fontWeight: 900, color: r.passed ? G : R, margin: '20px 0 8px', lineHeight: 1 }}>{r.percentage}%</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '24px 0' }}>
            {[['নম্বর', `${r.score}/${r.totalMarks}`], ['সঠিক', `${r.answers?.filter(a => a.isCorrect).length || 0}`], ['সময়', `${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s`]].map(([l, v]) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 10px' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#333' }}>{v}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Answer Review */}
          <div style={{ textAlign: 'left', maxHeight: 280, overflowY: 'auto', marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: '#333' }}>📋 উত্তর পর্যালোচনা</h4>
            {test.questions.map((q, i) => {
              const ans = r.answers?.find(a => a.questionIndex === i);
              return (
                <div key={i} style={{ marginBottom: 14, padding: '12px', background: ans?.isCorrect ? '#f0fdf4' : '#fff5f5', borderRadius: 10, border: `1.5px solid ${ans?.isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 8 }}>{i + 1}. {q.question}</div>
                  {q.options.map((opt, j) => (
                    <div key={j} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, marginBottom: 4, background: j === q.correctAnswer ? '#d1fae5' : (ans?.selectedAnswer === j && j !== q.correctAnswer) ? '#fee2e2' : 'transparent', fontWeight: j === q.correctAnswer ? 700 : 400, color: j === q.correctAnswer ? '#065f46' : '#555' }}>
                      {j === q.correctAnswer ? '✅' : ans?.selectedAnswer === j ? '❌' : '○'} {opt.text || opt}
                    </div>
                  ))}
                  {q.explanation && <div style={{ fontSize: 11, color: '#555', marginTop: 8, background: '#fffbeb', padding: '6px 10px', borderRadius: 6 }}>💡 {q.explanation}</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/student/tests')} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#333', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>📝 অন্য পরীক্ষা</button>
            <button onClick={() => navigate('/student/results')} style={{ flex: 1, padding: '12px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>📊 ফলাফল দেখুন</button>
          </div>
        </div>
      </div>
    );
  }

  const q = test.questions[current];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 22px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{test.titleBn || test.title}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{answered}/{test.questions.length} উত্তর দেওয়া হয়েছে</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: timeLeft < 120 ? R : G, fontFamily: 'monospace' }}>{fmt(timeLeft)}</div>
            <div style={{ fontSize: 11, color: '#888' }}>বাকি সময়</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(answered / test.questions.length) * 100}%`, background: `linear-gradient(90deg,${G},#00a876)`, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>

        {/* Question */}
        <div style={{ background: 'white', borderRadius: 18, padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>প্রশ্ন {current + 1}/{test.questions.length}</span>
            <span style={{ background: '#f0faf6', color: G, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{q.marks || 1} নম্বর</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.5, margin: '0 0 24px' }}>{q.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((opt, i) => {
              const sel = answers[current] === i;
              return (
                <div key={i} onClick={() => setAnswers(a => ({ ...a, [current]: i }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `2px solid ${sel ? G : '#e5e7eb'}`, background: sel ? '#e6f4f0' : 'white', cursor: 'pointer', transition: 'all 0.18s' }}
                  onMouseOver={e => { if (!sel) e.currentTarget.style.borderColor = '#a7f3d0'; }}
                  onMouseOut={e => { if (!sel) e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2.5px solid ${sel ? G : '#d1d5db'}`, background: sel ? G : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                    {sel && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: 15, color: sel ? G : '#333', fontWeight: sel ? 700 : 400 }}>{opt.text || opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            style={{ flex: 1, padding: '12px', background: 'white', color: current === 0 ? '#ccc' : '#333', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: current === 0 ? 'not-allowed' : 'pointer' }}>
            ← আগের
          </button>
          {current < test.questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)}
              style={{ flex: 1, padding: '12px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              পরেরটি →
            </button>
          ) : (
            <button onClick={() => handleSubmit(false)} disabled={submitting}
              style={{ flex: 1, padding: '12px', background: R, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '⏳ জমা হচ্ছে...' : '✅ জমা দিন'}
            </button>
          )}
        </div>

        {/* Question dots */}
        <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10 }}>প্রশ্ন নেভিগেশন</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {test.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${i === current ? G : answers[i] !== undefined ? G : '#e5e7eb'}`, background: i === current ? G : answers[i] !== undefined ? '#e6f4f0' : 'white', color: i === current ? 'white' : answers[i] !== undefined ? G : '#888', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

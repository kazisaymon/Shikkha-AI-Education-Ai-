import React, { useState, useEffect } from 'react';
import { testAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const G = '#006A4E', R = '#F42A41';

export default function ResultsPage() {
  const { language } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAPI.getMyResults().then(({ data }) => setResults(data.results || [])).finally(() => setLoading(false));
  }, []);

  const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const passed = results.filter(r => r.passed).length;

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900 }}>📊 {language === 'bn' ? 'আমার ফলাফল' : 'My Results'}</h2>
      <p style={{ margin: '0 0 24px', color: '#888', fontSize: 13 }}>{results.length} টি পরীক্ষার ফলাফল</p>

      {/* Summary */}
      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '📝', val: results.length, label: 'মোট পরীক্ষা', color: '#3b82f6' },
            { icon: '✅', val: `${passed}/${results.length}`, label: 'পাস করেছি', color: G },
            { icon: '📊', val: `${avgScore}%`, label: 'গড় স্কোর', color: '#f59e0b' },
          ].map(({ icon, val, label, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `4px solid ${color}` }}>
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color, marginTop: 6 }}>{val}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', color: G, padding: 40 }}>⏳ লোড হচ্ছে...</div>}

      <div style={{ display: 'grid', gap: 14 }}>
        {results.map(r => (
          <div key={r._id} style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: r.passed ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: r.passed ? G : R }}>{r.percentage}%</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800 }}>{r.test?.titleBn || r.test?.title || 'পরীক্ষা'}</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', flexWrap: 'wrap' }}>
                <span>🏆 {r.score}/{r.totalMarks} নম্বর</span>
                <span>✅ {r.answers?.filter(a => a.isCorrect).length || 0} সঠিক</span>
                <span>⏱ {Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</span>
                <span>📅 {new Date(r.submittedAt).toLocaleDateString('bn-BD')}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <span style={{ display: 'block', padding: '6px 16px', borderRadius: 20, background: r.passed ? '#d1fae5' : '#fee2e2', color: r.passed ? '#065f46' : '#991b1b', fontSize: 12, fontWeight: 800 }}>
                {r.passed ? '✅ পাস' : '❌ ফেল'}
              </span>
              <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 600, marginTop: 6, display: 'inline-block' }}>{r.test?.type}</span>
            </div>
          </div>
        ))}
        {!loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa', background: 'white', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>এখনো কোনো পরীক্ষা দেননি</p>
          </div>
        )}
      </div>
    </div>
  );
}

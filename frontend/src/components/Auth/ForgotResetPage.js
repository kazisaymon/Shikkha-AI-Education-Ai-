import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

const Card = ({ children }) => (
  <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,#003d2e 0%,${G} 50%,#00855f 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
    <div style={{ width:'100%', maxWidth:420 }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <div style={{ width:42, height:27, background:G, border:'2.5px solid rgba(255,255,255,0.6)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:12, height:12, borderRadius:'50%', background:R }} />
          </div>
          <span style={{ color:'white', fontSize:26, fontWeight:900 }}>শিক্ষা AI</span>
        </div>
      </div>
      <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ height:4, background:`linear-gradient(90deg,${G},${R})` }} />
        <div style={{ padding:'28px 28px 32px' }}>{children}</div>
      </div>
    </div>
  </div>
);

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('রিসেট ইমেইল পাঠানো হয়েছে!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <Card>
      {sent ? (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>📧</div>
          <h3 style={{ fontSize:20, fontWeight:800, color:'#111', marginBottom:12 }}>ইমেইল পাঠানো হয়েছে!</h3>
          <p style={{ color:'#777', fontSize:14, lineHeight:1.6, marginBottom:24 }}>
            <strong>{email}</strong> এ পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে। ইনবক্স চেক করুন।
          </p>
          <Link to="/login" style={{ color:G, fontWeight:700, textDecoration:'none', fontSize:14 }}>← লগইন পেজে ফিরে যান</Link>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize:20, fontWeight:800, color:'#111', marginBottom:8 }}>পাসওয়ার্ড ভুলে গেছেন?</h2>
          <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>আপনার ইমেইল দিন, আমরা রিসেট লিঙ্ক পাঠাবো।</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:13, color:'#444', display:'block', marginBottom:6, fontWeight:600 }}>ইমেইল ঠিকানা</label>
              <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'13px', background:loading?'#9ca3af':`linear-gradient(135deg,${G},#00a876)`, color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? '⏳ পাঠাচ্ছি...' : '📧 রিসেট লিঙ্ক পাঠান'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#777' }}>
            <Link to="/login" style={{ color:G, fontWeight:700, textDecoration:'none' }}>← লগইনে ফিরে যান</Link>
          </p>
        </>
      )}
    </Card>
  );
}

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password:'', confirm:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('পাসওয়ার্ড মিলছে না');
    if (form.password.length < 6) return toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'টোকেন মেয়াদ শেষ হয়ে গেছে');
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <h2 style={{ fontSize:20, fontWeight:800, color:'#111', marginBottom:8 }}>নতুন পাসওয়ার্ড সেট করুন</h2>
      <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>একটি শক্তিশালী পাসওয়ার্ড দিন।</p>
      <form onSubmit={handleSubmit}>
        {[{ k:'password', label:'নতুন পাসওয়ার্ড', ph:'কমপক্ষে ৬ অক্ষর' }, { k:'confirm', label:'পাসওয়ার্ড নিশ্চিত করুন', ph:'আবার দিন' }].map(({ k, label, ph }) => (
          <div key={k} style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, color:'#444', display:'block', marginBottom:6, fontWeight:600 }}>{label}</label>
            <input type="password" required placeholder={ph} value={form[k]} onChange={e => setForm({...form, [k]:e.target.value})}
              style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
          </div>
        ))}
        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:'13px', background:loading?'#9ca3af':`linear-gradient(135deg,${G},#00a876)`, color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', marginTop:6 }}>
          {loading ? '⏳ অপেক্ষা করুন...' : '🔑 পাসওয়ার্ড পরিবর্তন করুন'}
        </button>
      </form>
    </Card>
  );
}

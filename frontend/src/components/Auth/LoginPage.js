import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

function EntryScreen({ onSelect }) {
  const [lang, setLang] = useState('bn');
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,#003d2e 0%,${G} 50%,#00855f 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(244,42,65,0.08)' }} />
      <div style={{ position:'absolute', bottom:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <div style={{ width:52, height:34, background:G, border:'3px solid rgba(255,255,255,0.7)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:16, height:16, borderRadius:'50%', background:R }} />
            </div>
            <span style={{ color:'white', fontSize:32, fontWeight:900, letterSpacing:'-1px' }}>শিক্ষা AI</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14, margin:0 }}>
            {lang === 'bn' ? 'বাংলাদেশের সেরা শিক্ষা প্ল্যাটফর্ম' : "Bangladesh's Premier Learning Platform"}
          </p>
        </div>

        {/* Role Cards */}
        <p style={{ color:'rgba(255,255,255,0.8)', fontSize:15, textAlign:'center', marginBottom:20, fontWeight:600 }}>
          {lang === 'bn' ? 'আপনি কে? / আপনার পরিচয় বেছে নিন' : 'Who are you? Select your role'}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:32 }}>
          {[
            { role:'student', icon:'🎓', bn:'শিক্ষার্থী', en:'Student' },
            { role:'teacher', icon:'👨‍🏫', bn:'শিক্ষক', en:'Teacher' },
          ].map(({ role, icon, bn, en }) => (
            <div key={role} onClick={() => onSelect(role, lang)}
              style={{ background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:16, padding:'20px 10px', textAlign:'center', cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(10px)' }}
              onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.22)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}>
              <div style={{ fontSize:36, marginBottom:8 }}>{icon}</div>
              <div style={{ color:'white', fontSize:13, fontWeight:700 }}>{lang === 'bn' ? bn : en}</div>
            </div>
          ))}
        </div>

        {/* Lang toggle */}
        <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
          {['bn','en'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding:'7px 22px', borderRadius:20, border:'1.5px solid rgba(255,255,255,0.4)', background: lang===l ? 'white' : 'transparent', color: lang===l ? G : 'white', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
              {l === 'bn' ? '🇧🇩 বাংলা' : '🌐 English'}
            </button>
          ))}
        </div>

        <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:'rgba(255,255,255,0.5)' }}>
          {lang === 'bn' ? '🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ' : '🔒 Your data is completely secure'}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, toggleLanguage } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('entry'); // 'entry' | 'login'
  const [selectedRole, setSelectedRole] = useState('student');
  const [language, setLanguage] = useState('bn');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEntrySelect = (role, lang) => {
    setSelectedRole(role);
    setLanguage(lang);
    setStep('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`স্বাগতম, ${data.user.name}! 🎉`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'student') navigate('/student');
      else navigate('/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  const roleInfo = { student: { icon:'🎓', bn:'শিক্ষার্থী', en:'Student' }, teacher: { icon:'👨‍🏫', bn:'শিক্ষক', en:'Teacher' }, admin: { icon:'⚙️', bn:'অ্যাডমিন', en:'Admin' } };

  if (step === 'entry') return <EntryScreen onSelect={handleEntrySelect} />;

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,#003d2e 0%,${G} 50%,#00855f 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(244,42,65,0.08)' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:44, height:28, background:G, border:'2.5px solid rgba(255,255,255,0.6)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:13, height:13, borderRadius:'50%', background:R }} />
            </div>
            <span style={{ color:'white', fontSize:28, fontWeight:900, letterSpacing:'-0.5px' }}>শিক্ষা AI</span>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ height:4, background:`linear-gradient(90deg,${G},${R})` }} />
          <div style={{ padding:'28px 28px 32px' }}>
            {/* Back + Lang */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <button onClick={() => setStep('entry')} style={{ background:'#f0faf6', border:`1px solid #c6e8dd`, color:G, padding:'5px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                ← {language === 'bn' ? 'ফিরে যান' : 'Back'}
              </button>
              <button onClick={() => setLanguage(l => l === 'bn' ? 'en' : 'bn')} style={{ background:'#f0faf6', border:`1px solid #c6e8dd`, color:G, padding:'5px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                {language === 'bn' ? '🌐 English' : '🌐 বাংলা'}
              </button>
            </div>

            {/* Role badge */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'12px 16px', background:'#f0faf6', borderRadius:12, border:`1.5px solid #c6e8dd` }}>
              <span style={{ fontSize:26 }}>{roleInfo[selectedRole].icon}</span>
              <div>
                <div style={{ fontSize:11, color:'#888', fontWeight:500 }}>{language === 'bn' ? 'লগইন করছেন' : 'Logging in as'}</div>
                <div style={{ fontSize:15, fontWeight:800, color:G }}>{language === 'bn' ? roleInfo[selectedRole].bn : roleInfo[selectedRole].en}</div>
              </div>
            </div>

            <h2 style={{ fontSize:20, fontWeight:800, color:'#111', margin:'0 0 20px' }}>
              {language === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to your account'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, color:'#444', display:'block', marginBottom:6, fontWeight:600 }}>
                  {language === 'bn' ? 'ইমেইল' : 'Email'}
                </label>
                <input type="email" required placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                  style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
              </div>
              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:13, color:'#444', display:'block', marginBottom:6, fontWeight:600 }}>
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.password} onChange={e => setForm({...form, password:e.target.value})}
                    style={{ width:'100%', padding:'12px 44px 12px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
                  <button type="button" onClick={()=>setShowPass(!showPass)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#888' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={{ textAlign:'right', marginBottom:22 }}>
                <Link to="/forgot-password" style={{ fontSize:12, color:G, textDecoration:'none', fontWeight:600 }}>
                  {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </Link>
              </div>
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'13px', background:loading ? '#9ca3af' : `linear-gradient(135deg,${G},#00a876)`, color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:800, cursor:loading ? 'not-allowed' : 'pointer', boxShadow:loading ? 'none' : '0 4px 14px rgba(0,106,78,0.35)', transition:'all 0.2s' }}>
                {loading ? '⏳ অপেক্ষা করুন...' : `🔓 ${language === 'bn' ? 'লগইন করুন' : 'Login'}`}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:22, fontSize:13, color:'#777' }}>
              {language === 'bn' ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
              <Link to="/register" style={{ color:G, fontWeight:700, textDecoration:'none' }}>
                {language === 'bn' ? 'নিবন্ধন করুন' : 'Register'}
              </Link>
            </p>
          </div>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'rgba(255,255,255,0.45)' }}>
          🔒 {language === 'bn' ? 'আপনার তথ্য সম্পূর্ণ নিরাপদ' : 'Your data is completely secure'}
        </p>
      </div>
    </div>
  );
}

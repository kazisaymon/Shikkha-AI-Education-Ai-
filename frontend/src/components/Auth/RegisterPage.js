import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState('bn');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error(lang === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match');
    if (form.password.length < 6) return toast.error(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' : 'Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, role, form.phone);
      toast.success(lang === 'bn' ? 'নিবন্ধন সফল! 🎉' : 'Registration successful! 🎉');
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'student') navigate('/student');
      else navigate('/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে' : 'Registration failed'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,#003d2e 0%,${G} 50%,#00855f 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-100, right:-100, width:350, height:350, borderRadius:'50%', background:'rgba(244,42,65,0.08)' }} />
      <div style={{ width:'100%', maxWidth:460, position:'relative', zIndex:1 }}>
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
          <div style={{ padding:'24px 28px 30px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#111', margin:0 }}>
                {lang === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create new account'}
              </h2>
              <button onClick={() => setLang(l => l==='bn'?'en':'bn')} style={{ background:'#f0faf6', border:`1px solid #c6e8dd`, color:G, padding:'5px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                {lang === 'bn' ? '🌐 English' : '🌐 বাংলা'}
              </button>
            </div>

            {/* Role */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22 }}>
              {[{ k:'student', i:'🎓', bn:'শিক্ষার্থী', en:'Student' }, { k:'teacher', i:'👨‍🏫', bn:'শিক্ষক', en:'Teacher' }].map(({ k, i, bn, en }) => (
                <div key={k} onClick={() => setRole(k)}
                  style={{ padding:'12px 8px', border:`2px solid ${role===k?G:'#e5e7eb'}`, borderRadius:12, textAlign:'center', cursor:'pointer', background:role===k?'#e6f4f0':'#fafafa', transition:'all 0.2s' }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{i}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:role===k?G:'#555' }}>{lang==='bn'?bn:en}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {[
                { key:'name', label:'নাম / Name', type:'text', placeholder:'আপনার পূর্ণ নাম' },
                { key:'email', label:'ইমেইল / Email', type:'email', placeholder:'your@email.com' },
                { key:'phone', label:'ফোন (ঐচ্ছিক)', type:'tel', placeholder:'01XXXXXXXXX' },
                { key:'password', label:'পাসওয়ার্ড', type:'password', placeholder:'কমপক্ষে ৬ অক্ষর' },
                { key:'confirm', label:'পাসওয়ার্ড নিশ্চিত করুন', type:'password', placeholder:'পাসওয়ার্ড আবার দিন' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, color:'#444', display:'block', marginBottom:5, fontWeight:600 }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]:e.target.value})}
                    required={key !== 'phone'}
                    style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
                </div>
              ))}
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'13px', background:loading?'#9ca3af':`linear-gradient(135deg,${G},#00a876)`, color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', marginTop:6, boxShadow:loading?'none':'0 4px 14px rgba(0,106,78,0.35)' }}>
                {loading ? '⏳ অপেক্ষা করুন...' : '✅ ' + (lang==='bn'?'নিবন্ধন করুন':'Register')}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#777' }}>
              {lang==='bn'?'আগে থেকে অ্যাকাউন্ট আছে?':"Already have an account?"}{' '}
              <Link to="/login" style={{ color:G, fontWeight:700, textDecoration:'none' }}>{lang==='bn'?'লগইন করুন':'Login'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

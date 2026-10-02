import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

const NAV = {
  student: [
    { path:'/student', icon:'🏠', label:'ড্যাশবোর্ড', labelEn:'Dashboard' },
    { path:'/student/courses', icon:'📚', label:'কোর্সসমূহ', labelEn:'Courses' },
    { path:'/student/tests', icon:'📝', label:'পরীক্ষা', labelEn:'Tests' },
    { path:'/student/results', icon:'📊', label:'ফলাফল', labelEn:'Results' },
    { path:'/student/materials', icon:'📂', label:'ক্লাস ম্যাটেরিয়াল', labelEn:'Materials' },
    { path:'/student/ai', icon:'🤖', label:'AI সহকারী', labelEn:'AI Assistant' },
  ],
  teacher: [
    { path:'/teacher', icon:'🏠', label:'ড্যাশবোর্ড', labelEn:'Dashboard' },
    { path:'/teacher/courses', icon:'📚', label:'আমার কোর্স', labelEn:'My Courses' },
    { path:'/teacher/tests', icon:'📝', label:'পরীক্ষা', labelEn:'Tests' },
    { path:'/teacher/materials', icon:'📂', label:'ক্লাস ম্যাটেরিয়াল', labelEn:'Materials' },
    { path:'/teacher/students', icon:'👥', label:'শিক্ষার্থী', labelEn:'Students' },
    { path:'/teacher/ai', icon:'🤖', label:'AI সহকারী', labelEn:'AI Assistant' },
  ],
  admin: [
    { path:'/admin', icon:'📊', label:'ড্যাশবোর্ড', labelEn:'Dashboard' },
    { path:'/admin/users', icon:'👥', label:'ব্যবহারকারী', labelEn:'Users' },
    { path:'/admin/courses', icon:'📚', label:'কোর্সসমূহ', labelEn:'Courses' },
    { path:'/admin/tests', icon:'📝', label:'পরীক্ষা', labelEn:'Tests' },
    { path:'/admin/materials', icon:'📂', label:'ম্যাটেরিয়াল', labelEn:'Materials' },
    { path:'/admin/ai', icon:'🤖', label:'AI সহকারী', labelEn:'AI Assistant' },
  ],
};

export default function Layout({ children, role }) {
  const { user, logout, language, toggleLanguage } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = NAV[role] || NAV.student;
  const isMobile = window.innerWidth < 768;

  const handleLogout = () => { logout(); toast.success('লগআউট সফল'); navigate('/login'); };

  const Sidebar = () => (
    <div style={{ width: collapsed ? 68 : 240, minHeight:'100vh', background:`linear-gradient(180deg,#003d2e 0%,${G} 100%)`, display:'flex', flexDirection:'column', flexShrink:0, transition:'width 0.25s', position:'relative', zIndex:10 }}>
      {/* Header */}
      <div style={{ padding: collapsed ? '20px 14px' : '20px 18px', borderBottom:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {!collapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:20, background:G, border:'2px solid rgba(255,255,255,0.6)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:R }} />
            </div>
            <span style={{ color:'white', fontSize:18, fontWeight:900 }}>শিক্ষা AI</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'white', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${R},#ff6b80)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'white', flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ color:'white', fontSize:14, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:500 }}>
                {role === 'admin' ? '⚙️ অ্যাডমিন' : role === 'teacher' ? '👨‍🏫 শিক্ষক' : '🎓 শিক্ষার্থী'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:4 }}>
        {nav.map(({ path, icon, label, labelEn }) => {
          const active = location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path} style={{ textDecoration:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding: collapsed ? '12px 14px' : '11px 14px', borderRadius:10, background: active ? 'rgba(255,255,255,0.2)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: active ? 700 : 500, fontSize:14, transition:'all 0.18s', cursor:'pointer', border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent' }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='white'; }}}
                onMouseOut={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}}>
                <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                {!collapsed && <span>{language === 'bn' ? label : labelEn}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.12)', display:'flex', flexDirection:'column', gap:4 }}>
        <button onClick={toggleLanguage}
          style={{ display:'flex', alignItems:'center', gap:10, padding: collapsed ? '10px 14px' : '10px 14px', borderRadius:10, background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:600, cursor:'pointer', width:'100%', textAlign:'left' }}>
          <span style={{ fontSize:18 }}>🌐</span>
          {!collapsed && <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>}
        </button>
        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:10, padding: collapsed ? '10px 14px' : '10px 14px', borderRadius:10, background:'rgba(244,42,65,0.15)', border:'1px solid rgba(244,42,65,0.3)', color:'#ffb3bc', fontSize:13, fontWeight:600, cursor:'pointer', width:'100%', textAlign:'left' }}>
          <span style={{ fontSize:18 }}>🚪</span>
          {!collapsed && <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc' }}>
      <Sidebar />
      <main style={{ flex:1, overflow:'auto', minWidth:0 }}>
        {children}
      </main>
    </div>
  );
}

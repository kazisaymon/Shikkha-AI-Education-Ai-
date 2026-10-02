import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const G = '#006A4E', R = '#F42A41';

function MsgBubble({ msg, isLast }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16, alignItems: 'flex-end', gap: 8 }}>
      {!isUser && (
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${G},#00a876)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
      )}
      <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isUser ? `linear-gradient(135deg,${G},#00a876)` : 'white', color: isUser ? 'white' : '#222', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${R},#ff6b80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
      )}
    </div>
  );
}

export default function ChatbotPage() {
  const { language } = useAuth();
  const [messages, setMessages] = useState([{ role: 'assistant', content: language === 'bn' ? '🎓 আস্সালামু আলাইকুম! আমি শিক্ষা AI। আপনার পড়াশোনায় যেকোনো প্রশ্ন করুন। ছবি আপলোড করে প্রশ্ন করতে পারবেন! 📚' : "🎓 Hello! I'm Shikkha AI. Ask me anything about your studies. You can also upload images! 📚" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [histories, setHistories] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [provider, setProvider] = useState('');
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    aiAPI.getHistories().then(({ data }) => setHistories(data.histories || [])).catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !image) || loading) return;
    const userMsg = { role: 'user', content: input || '[ছবি পাঠানো হয়েছে]' };
    setMessages(m => [...m, userMsg]);
    const msgText = input;
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.chat({ message: msgText, chatId, imageBase64: image, imageMimeType: 'image/jpeg' });
      setMessages(m => [...m, { role: 'assistant', content: data.message }]);
      setChatId(data.chatId);
      setProvider(data.provider || '');
      if (!chatId) aiAPI.getHistories().then(({ data: d }) => setHistories(d.histories || [])).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || 'AI সংযোগে সমস্যা হয়েছে। API key চেক করুন।';
      setMessages(m => [...m, { role: 'assistant', content: `❌ ${msg}` }]);
      toast.error(msg);
    } finally {
      setLoading(false);
      setImage(null);
      setImagePreview(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const loadHistory = async (id) => {
    try {
      const { data } = await aiAPI.getHistory(id);
      setMessages(data.history.messages);
      setChatId(id);
    } catch { toast.error('লোড ব্যর্থ'); }
  };

  const newChat = () => { setMessages([{ role: 'assistant', content: language === 'bn' ? '🎓 নতুন কথোপকথন শুরু হয়েছে! কী জানতে চান?' : '🎓 New chat started! What would you like to know?' }]); setChatId(null); setProvider(''); };

  const deleteHistory = async (id, e) => {
    e.stopPropagation();
    await aiAPI.deleteChat(id);
    setHistories(h => h.filter(x => x._id !== id));
    if (chatId === id) newChat();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* Sidebar */}
      {showSidebar && (
        <div style={{ width: 260, background: 'white', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '18px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <button onClick={newChat} style={{ width: '100%', padding: '10px', background: G, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              ✏️ নতুন চ্যাট
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700, padding: '8px 8px 6px', textTransform: 'uppercase' }}>আগের কথোপকথন</div>
            {histories.map(h => (
              <div key={h._id} onClick={() => loadHistory(h._id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, background: chatId === h._id ? '#e6f4f0' : 'transparent', color: chatId === h._id ? G : '#444', transition: 'all 0.18s' }}
                onMouseOver={e => { if (chatId !== h._id) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseOut={e => { if (chatId !== h._id) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>💬 {h.title || 'চ্যাট'}</span>
                <button onClick={(e) => deleteHistory(h._id, e)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: '0 4px' }}
                  onMouseOver={e => e.target.style.color = R} onMouseOut={e => e.target.style.color = '#ccc'}>×</button>
              </div>
            ))}
            {histories.length === 0 && <p style={{ color: '#ccc', fontSize: 12, textAlign: 'center', padding: '20px 8px' }}>কোনো আগের চ্যাট নেই</p>}
          </div>
        </div>
      )}

      {/* Main chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: '#f3f4f6', border: 'none', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>☰</button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${G},#00a876)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>শিক্ষা AI সহকারী</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>
                {loading ? '⌨️ টাইপ করছে...' : provider ? `✅ ${provider} দ্বারা চালিত` : '🟢 প্রস্তুত'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={newChat} style={{ padding: '7px 14px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#555' }}>🔄 নতুন</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {messages.map((msg, i) => <MsgBubble key={i} msg={msg} isLast={i === messages.length - 1} />)}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${G},#00a876)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div style={{ background: 'white', padding: '12px 18px', borderRadius: '18px 18px 18px 4px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: G, opacity: 0.6, animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div style={{ padding: '8px 24px 0', flexShrink: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: `1.5px solid ${G}`, borderRadius: 10, padding: '8px 12px' }}>
              <img src={imagePreview} alt="preview" style={{ height: 48, borderRadius: 6, objectFit: 'cover' }} />
              <span style={{ fontSize: 12, color: G, fontWeight: 600 }}>ছবি যুক্ত</span>
              <button onClick={() => { setImage(null); setImagePreview(null); }} style={{ background: 'none', border: 'none', color: R, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          </div>
        )}

        {/* Quick prompts */}
        <div style={{ padding: '8px 24px 0', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {['📐 গণিতের সমস্যা সমাধান', '📖 অধ্যায় সারসংক্ষেপ', '💡 ব্যাখ্যা করুন', '✍️ প্রশ্ন তৈরি করুন'].map(p => (
            <button key={p} onClick={() => setInput(p.slice(3))}
              style={{ padding: '6px 14px', background: '#f0faf6', border: `1.5px solid #c6e8dd`, color: G, borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px 20px', background: 'white', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: '#f8fafc', borderRadius: 16, padding: '10px 14px', border: '1.5px solid #e5e7eb' }}>
            <button onClick={() => fileRef.current?.click()} title="ছবি যুক্ত করুন"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888', flexShrink: 0, padding: '2px' }}>
              📎
            </button>
            <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={language === 'bn' ? 'প্রশ্ন করুন... (Shift+Enter = নতুন লাইন)' : 'Ask a question... (Shift+Enter = new line)'}
              rows={1} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, resize: 'none', maxHeight: 120, overflowY: 'auto', lineHeight: 1.6, fontFamily: 'inherit' }} />
            <button onClick={sendMessage} disabled={loading || (!input.trim() && !image)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: (loading || (!input.trim() && !image)) ? '#e5e7eb' : `linear-gradient(135deg,${G},#00a876)`, border: 'none', cursor: (loading || (!input.trim() && !image)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'all 0.2s' }}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

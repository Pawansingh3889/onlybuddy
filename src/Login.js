import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

export default function Login() {
  const { login, signup } = useAuth();
  const { theme: T, isDark, toggleTheme } = useTheme();
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('customer');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // ── Validation ──
    if (!email.trim())    return setError('Please enter your email.');
    if (!password.trim()) return setError('Please enter your password.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (mode === 'signup' && !name.trim()) return setError('Please enter your name.');

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, role, name.trim());
      }
    } catch (err) {
      const map = {
        'auth/invalid-credential':    'Email or password is incorrect.',
        'auth/user-not-found':        'No account found with that email.',
        'auth/wrong-password':        'Incorrect password.',
        'auth/email-already-in-use':  'That email is already registered. Please sign in.',
        'auth/weak-password':         'Password must be at least 6 characters.',
        'auth/invalid-email':         'Please enter a valid email address.',
        'auth/too-many-requests':     'Too many attempts. Please try again later.',
        'auth/network-request-failed':'Network error. Check your internet connection.',
        'auth/operation-not-allowed': 'Email sign-in is not enabled. Contact support.',
      };
      setError(map[err.code] || `Error: ${err.message}`);
    }
    setLoading(false);
  };

  const ROLES = [
    { id:'customer', icon:'🛒', label:'Customer', desc:'Book errands & deliveries' },
    { id:'buddy',    icon:'🏃', label:'Buddy',    desc:'Earn by completing jobs' },
  ];

  const inputStyle = {
    width:'100%', background:T.card2, border:`1.5px solid ${T.border}`,
    borderRadius:10, padding:'11px 14px 11px 40px',
    color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif",
    outline:'none', transition:'border-color 0.2s',
  };

  return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex',
      alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden' }}>

      {/* Decorative orbs */}
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%',
        background:`radial-gradient(circle, ${T.primaryHex}28 0%, transparent 70%)`,
        top:'-10%', right:'-10%', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%',
        background:`radial-gradient(circle, ${T.accentBg} 0%, transparent 70%)`,
        bottom:'5%', left:'-8%', filter:'blur(60px)', pointerEvents:'none' }} />

      {/* Theme toggle top right */}
      <button onClick={toggleTheme}
        style={{ position:'fixed', top:16, right:16,
          background:T.card2, border:`1px solid ${T.border}`,
          borderRadius:10, width:38, height:38, cursor:'pointer',
          fontSize:18, display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:10 }}>
        {isDark?'☀️':'🌙'}
      </button>

      <div style={{ background:T.card, border:`1px solid ${T.border}`,
        borderRadius:28, padding:'40px 36px', width:'100%', maxWidth:420,
        boxShadow:T.shadow, position:'relative', zIndex:1,
        animation:'scaleIn 0.35s ease both' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, display:'inline-block', animation:'float 3s ease-in-out infinite' }}>🤝</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:900,
            background:`linear-gradient(135deg,${T.primary},${T.primaryLight})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', display:'block', marginTop:4 }}>
            OnlyBuddy
          </div>
          <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Hull's Errand &amp; Grocery App</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display:'flex', background:T.bg2, borderRadius:12,
          padding:4, marginBottom:24 }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex:1, padding:'9px', borderRadius:10, border:'none',
                background: mode===m ? T.card : 'transparent',
                color:      mode===m ? T.text : T.muted,
                fontWeight: mode===m ? 700 : 500,
                fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                boxShadow: mode===m ? T.shadowSm : 'none', transition:'all 0.2s' }}>
              {m==='login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {mode==='signup' && (
            <div style={{ animation:'fadeUp 0.25s ease' }}>
              <label style={{ fontSize:11, fontWeight:700, color:T.muted,
                letterSpacing:0.8, display:'block', marginBottom:6 }}>YOUR NAME</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:13, top:'50%',
                  transform:'translateY(-50%)', fontSize:16 }}>👤</span>
                <input style={inputStyle} type="text" value={name}
                  onChange={e=>setName(e.target.value)}
                  placeholder="e.g. John Cena"
                  onFocus={e=>e.target.style.borderColor=T.primary}
                  onBlur={e=>e.target.style.borderColor=T.border} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:T.muted,
              letterSpacing:0.8, display:'block', marginBottom:6 }}>EMAIL ADDRESS</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%',
                transform:'translateY(-50%)', fontSize:16 }}>✉️</span>
              <input style={inputStyle} type="email" value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com"
                onFocus={e=>e.target.style.borderColor=T.primary}
                onBlur={e=>e.target.style.borderColor=T.border} />
            </div>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:T.muted,
              letterSpacing:0.8, display:'block', marginBottom:6 }}>PASSWORD</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%',
                transform:'translateY(-50%)', fontSize:16 }}>🔒</span>
              <input style={inputStyle} type="password" value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder={mode==='signup'?'Min 6 characters':'Your password'}
                onFocus={e=>e.target.style.borderColor=T.primary}
                onBlur={e=>e.target.style.borderColor=T.border} />
            </div>
          </div>

          {mode==='signup' && (
            <div style={{ animation:'fadeUp 0.25s ease' }}>
              <label style={{ fontSize:11, fontWeight:700, color:T.muted,
                letterSpacing:0.8, display:'block', marginBottom:8 }}>I AM A...</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    style={{ padding:12, borderRadius:12,
                      border:`2px solid ${role===r.id ? T.primary : T.border}`,
                      background: role===r.id ? T.primaryBg : T.card2,
                      cursor:'pointer', textAlign:'center',
                      transition:'all 0.18s', fontFamily:"'DM Sans',sans-serif" }}>
                    <div style={{ fontSize:24 }}>{r.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700,
                      color: role===r.id ? T.primary : T.text, marginTop:4 }}>{r.label}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background:T.redBg, border:`1px solid ${T.red}`,
              borderRadius:10, padding:'10px 14px', fontSize:13,
              color:T.red, display:'flex', alignItems:'center', gap:8,
              animation:'fadeUp 0.2s ease' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ marginTop:4, padding:14, borderRadius:12,
              background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`,
              color:'#fff', border:'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700,
              opacity: loading ? 0.7 : 1,
              boxShadow:`0 4px 20px ${T.primaryHex}44`,
              transition:'all 0.2s', letterSpacing:0.2 }}>
            {loading ? '⏳ Please wait...' : mode==='login' ? 'Sign In →' : 'Create My Account →'}
          </button>
        </form>

        <div style={{ marginTop:20, padding:'12px 14px', background:T.bg2,
          borderRadius:12, fontSize:12, color:T.muted, textAlign:'center', lineHeight:1.7 }}>
          <strong style={{ color:T.text2 }}>Hull · HU5</strong> · Fully insured · Verified Buddies<br/>
          <span style={{ fontSize:11 }}>🔒 Secured by Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}

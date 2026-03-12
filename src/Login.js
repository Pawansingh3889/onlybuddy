import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// ── Email validation
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Password strength
const passwordStrength = (p) => {
  if (p.length === 0) return null;
  if (p.length < 6)   return { level: 0, label: 'Too short',  color: '#EF4444' };
  if (p.length < 8)   return { level: 1, label: 'Weak',       color: '#F97316' };
  const hasUpper  = /[A-Z]/.test(p);
  const hasNum    = /[0-9]/.test(p);
  const hasSymbol = /[^A-Za-z0-9]/.test(p);
  const score = [hasUpper, hasNum, hasSymbol].filter(Boolean).length;
  if (score === 0) return { level: 1, label: 'Weak',      color: '#F97316' };
  if (score === 1) return { level: 2, label: 'Fair',      color: '#EAB308' };
  if (score === 2) return { level: 3, label: 'Good',      color: '#22C55E' };
  return             { level: 4, label: 'Strong 💪',    color: '#059669' };
};

// ── UK phone formatter
const formatUKPhone = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 10) return `${digits.slice(0,5)} ${digits.slice(5)}`;
  return `${digits.slice(0,5)} ${digits.slice(5,8)} ${digits.slice(8)}`;
};

export default function Login() {
  const { theme } = useTheme();
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // mode: 'login' | 'signup' | 'reset'
  const [mode, setMode]           = useState('login');
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [agreed, setAgreed]       = useState(false);

  const pwStrength = passwordStrength(password);
  const emailError = emailTouched && email && !isValidEmail(email);

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setPassword('');
    setConfirmPass(''); setError(''); setSuccess('');
    setEmailTouched(false); setAgreed(false);
  };

  const switchMode = (m) => { resetForm(); setMode(m); };

  // ── SUBMIT
  const submit = async () => {
    setError(''); setSuccess('');

    // Forgot password
    if (mode === 'reset') {
      if (!email) { setError('Please enter your email address'); return; }
      if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccess('✅ Reset email sent! Check your inbox (and spam folder).');
      } catch (e) {
        const msg =
          e.code === 'auth/user-not-found'        ? 'No account found with that email.' :
          e.code === 'auth/invalid-email'         ? 'Please enter a valid email address.' :
          e.code === 'auth/too-many-requests'     ? 'Too many attempts. Please wait a few minutes.' :
          e.code === 'auth/network-request-failed'? 'Network error — check your connection.' :
          e.code === 'auth/invalid-api-key'       ? 'App configuration error. Please contact support.' :
          `Failed to send reset email. (${e.code || 'unknown error'})`;
        setError(msg);
      } finally { setLoading(false); }
      return;
    }

    // Validation
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }

    if (mode === 'signup') {
      if (!name.trim())        { setError('Please enter your full name'); return; }
      if (!phone.trim())       { setError('Please enter your phone number'); return; }
      if (phone.replace(/\D/,'').length < 10) { setError('Please enter a valid UK phone number'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (password !== confirmPass) { setError('Passwords do not match'); return; }
      if (!agreed) { setError('Please agree to the Terms of Service to continue'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { user } = await login(email, password);
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const role = snap.exists() ? (snap.data()?.role || 'customer') : 'customer';
          if (role === 'admin') { navigate('/admin'); return; }
          if (role === 'buddy') { navigate('/buddy'); return; }
        } catch {}
        navigate('/');
      } else {
        await signup(email, password, name, phone);
        navigate('/');
      }
    } catch (e) {
      const msg =
        e.code === 'auth/wrong-password'           ? 'Incorrect password. Try again or reset it below.' :
        e.code === 'auth/user-not-found'           ? 'No account found with that email address.' :
        e.code === 'auth/email-already-in-use'     ? 'An account already exists with this email.' :
        e.code === 'auth/weak-password'            ? 'Password must be at least 6 characters.' :
        e.code === 'auth/too-many-requests'        ? 'Too many attempts. Please wait a few minutes.' :
        e.code === 'auth/invalid-credential'       ? 'Incorrect email or password.' :
        'Something went wrong. Please try again.';
      setError(msg);
    } finally { setLoading(false); }
  };

  // ── STYLES
  const inp = (hasError) => ({
    width: '100%', background: theme.bg2,
    border: `1.5px solid ${hasError ? theme.red : theme.border}`,
    borderRadius: 12, padding: '13px 16px',
    color: theme.text, fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none', transition: 'border-color 0.2s',
  });
  const label = { fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' };

  const FEATURES = [
    { icon: '🛒', text: 'Grocery delivery in 30 min' },
    { icon: '💊', text: 'Prescription runs covered'   },
    { icon: '📦', text: 'Parcels & returns sorted'    },
    { icon: '🔍', text: 'DBS checked Buddies'         },
  ];

  return (
    <div style={{ background: theme.bg, minHeight: '90vh', display: 'flex', alignItems: 'stretch' }}>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:none} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .auth-input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}22; }
        .tab-btn:hover { background: ${theme.bg2} !important; }
        .social-btn:hover { background: ${theme.bg2} !important; transform: translateY(-1px); }
        .switch-link:hover { text-decoration: underline; }
      `}</style>

      {/* ── LEFT PANEL (desktop only) */}
      <div style={{ flex: 1, background: `linear-gradient(145deg, ${theme.primaryDark} 0%, ${theme.primary} 55%, #8B5CF6 100%)`, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }} className="auth-left">
        <style>{`@media(max-width:820px){.auth-left{display:none!important}}`}</style>
        <div style={{ animation: 'slideIn 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, backdropFilter: 'blur(8px)' }}>🤝</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>OnlyBuddy</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>HULL'S ERRAND APP</div>
            </div>
          </div>

          <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1.15, marginBottom: 16 }}>
            Your errands.<br />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Handled.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
            Send a verified local Buddy to handle anything — groceries, prescriptions, queues, parcels — while you get on with your day.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: 32 }}>
            {[['500+', 'Orders Done'], ['4.9★', 'Avg Rating'], ['30min', 'Avg Delivery']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>

          {/* Mobile logo */}
          <div style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }} className="mobile-logo">
            <style>{`@media(max-width:820px){.mobile-logo{display:flex!important}}`}</style>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤝</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary, fontFamily: "'Outfit', sans-serif" }}>OnlyBuddy</div>
          </div>

          {/* ── Tab switcher (login/signup) */}
          {mode !== 'reset' && (
            <div style={{ display: 'flex', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 4, marginBottom: 28 }}>
              {[['login', '👋 Sign In'], ['signup', '✨ Create Account']].map(([m, label]) => (
                <button key={m} className="tab-btn" onClick={() => switchMode(m)} style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: mode === m ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` : 'transparent', color: mode === m ? '#fff' : theme.muted, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: '32px 28px' }}>

            {/* ── RESET MODE */}
            {mode === 'reset' && (
              <div>
                <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0, fontFamily: "'Inter', sans-serif" }}>
                  ← Back to Sign In
                </button>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>🔐</div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Forgot Password?</div>
                  <div style={{ fontSize: 14, color: theme.muted, marginTop: 6, lineHeight: 1.6 }}>No worries! Enter your email and we'll send you a reset link.</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Email Address</label>
                  <input className="auth-input" style={inp(false)} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
                </div>
                {error   && <div style={{ background: theme.redBg, border: `1px solid ${theme.red}33`, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: theme.red, fontWeight: 600, marginBottom: 14 }}>⚠️ {error}</div>}
                {success && <div style={{ background: theme.greenBg, border: `1px solid ${theme.green}33`, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: theme.green, fontWeight: 600, marginBottom: 14 }}>{success}</div>}
                <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading ? theme.muted : `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif" }}>
                  {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
                </button>
              </div>
            )}

            {/* ── LOGIN / SIGNUP FORMS */}
            {mode !== 'reset' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                    {mode === 'login' ? 'Welcome back 👋' : 'Join OnlyBuddy ✨'}
                  </div>
                  <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>
                    {mode === 'login' ? 'Sign in to book errands and track orders' : 'Create your free account — takes 30 seconds'}
                  </div>
                </div>

                {/* SIGNUP ONLY FIELDS */}
                {mode === 'signup' && (
                  <>
                    <div>
                      <label style={label}>Full Name</label>
                      <input className="auth-input" style={inp(false)} placeholder="e.g. Charlie Lambert" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                      <label style={label}>Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: theme.muted, fontWeight: 600, pointerEvents: 'none' }}>🇬🇧 +44</div>
                        <input className="auth-input" style={{ ...inp(false), paddingLeft: 72 }} type="tel" placeholder="07712 345678" value={phone} onChange={e => setPhone(formatUKPhone(e.target.value))} maxLength={14} />
                      </div>
                      <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>Used to contact you about your orders — never shared</div>
                    </div>
                  </>
                )}

                {/* EMAIL */}
                <div>
                  <label style={label}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input className="auth-input" style={inp(emailError)} type="email" placeholder="your@email.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                    />
                    {email && isValidEmail(email) && (
                      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: theme.green, fontSize: 16 }}>✓</div>
                    )}
                  </div>
                  {emailError && <div style={{ fontSize: 12, color: theme.red, marginTop: 4, fontWeight: 600 }}>⚠ Please enter a valid email address</div>}
                </div>

                {/* PASSWORD */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...label, marginBottom: 0 }}>Password</label>
                    {mode === 'login' && (
                      <span onClick={() => switchMode('reset')} style={{ fontSize: 12, color: theme.primary, fontWeight: 700, cursor: 'pointer' }} className="switch-link">
                        Forgot password?
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="auth-input" style={{ ...inp(false), paddingRight: 48 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
                    <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Password strength bar — signup only */}
                  {mode === 'signup' && pwStrength && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(pwStrength.level / 4) * 100}%`, background: pwStrength.color, borderRadius: 2, transition: 'all 0.3s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: pwStrength.color, fontWeight: 700, marginTop: 4 }}>{pwStrength.label}</div>
                    </div>
                  )}
                </div>

                {/* CONFIRM PASSWORD — signup only */}
                {mode === 'signup' && (
                  <div>
                    <label style={label}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input className="auth-input" style={inp(confirmPass && password !== confirmPass)} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                      {confirmPass && password === confirmPass && (
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: theme.green, fontSize: 16 }}>✓</div>
                      )}
                    </div>
                    {confirmPass && password !== confirmPass && <div style={{ fontSize: 12, color: theme.red, marginTop: 4, fontWeight: 600 }}>⚠ Passwords do not match</div>}
                  </div>
                )}

                {/* Terms — signup only */}
                {mode === 'signup' && (
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '12px 14px', borderRadius: 12, background: agreed ? theme.greenBg : theme.bg2, border: `1.5px solid ${agreed ? theme.green : theme.border}`, transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: theme.primary, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: theme.text2, lineHeight: 1.5 }}>
                      I agree to the <span style={{ color: theme.primary, fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: theme.primary, fontWeight: 700 }}>Privacy Policy</span>
                    </span>
                  </label>
                )}

                {/* Error */}
                {error && (
                  <div style={{ background: theme.redBg, border: `1px solid ${theme.red}33`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: theme.red, fontWeight: 600 }}>
                    ⚠️ {error}
                    {error.includes('reset') && (
                      <span onClick={() => switchMode('reset')} style={{ color: theme.primary, cursor: 'pointer', marginLeft: 6, fontWeight: 700 }}>Reset it →</span>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: 13, border: 'none', background: loading ? theme.muted : `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: loading ? 'none' : `0 4px 18px ${theme.primary}44`, transition: 'all 0.2s', marginTop: 4 }}>
                  {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In to OnlyBuddy →' : 'Create My Account →'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: theme.border }} />
                  <span style={{ fontSize: 12, color: theme.muted, fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: theme.border }} />
                </div>

                {/* Switch mode */}
                <div style={{ textAlign: 'center', fontSize: 14, color: theme.muted }}>
                  {mode === 'login' ? (
                    <>New to OnlyBuddy? <span onClick={() => switchMode('signup')} style={{ color: theme.primary, fontWeight: 800, cursor: 'pointer' }} className="switch-link">Create free account →</span></>
                  ) : (
                    <>Already have an account? <span onClick={() => switchMode('login')} style={{ color: theme.primary, fontWeight: 800, cursor: 'pointer' }} className="switch-link">Sign in →</span></>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Bottom link */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: theme.muted }}>
            Want to earn £10–£18/hr? <Link to="/apply" style={{ color: theme.primary, fontWeight: 700, textDecoration: 'none' }}>Apply to be a Buddy →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// ── Validation helpers ────────────────────────────────────────
const validators = {
  email: v => {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return null;
  },
  password: v => {
    if (!v) return 'Password is required';
    if (v.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter';
    if (!/[0-9]/.test(v)) return 'Include at least one number';
    return null;
  },
  name: v => {
    if (!v?.trim()) return 'Full name is required';
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  },
  phone: v => {
    if (!v) return 'Phone number is required';
    const digits = v.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return 'Enter a valid UK phone number';
    return null;
  },
};

const FIREBASE_ERRORS = {
  'auth/email-already-in-use':    'An account with this email already exists',
  'auth/invalid-email':           'Invalid email address',
  'auth/weak-password':           'Password is too weak',
  'auth/user-not-found':          'No account found with this email',
  'auth/wrong-password':          'Incorrect password',
  'auth/invalid-credential':      'Incorrect email or password',
  'auth/too-many-requests':       'Too many attempts — please try again later',
  'auth/network-request-failed':  'Network error — check your connection',
  'auth/user-disabled':           'This account has been disabled',
};

function Field({ label, type = 'text', value, onChange, error, placeholder, icon, hint }) {
  const { theme: T } = useTheme();
  const [show, setShow] = useState(false);
  const inputType = type === 'password' ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 0.8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, pointerEvents: 'none',
          }}>{icon}</span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: icon ? '11px 40px 11px 38px' : '11px 40px 11px 14px',
            background: error ? T.redBg : T.card2,
            border: `1.5px solid ${error ? T.red : T.border}`,
            borderRadius: 12, color: T.text, fontSize: 14,
            fontFamily: "'DM Sans', sans-serif", outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.boxShadow = `0 0 0 3px ${T.primary}20`; }}
          onBlur={e => { e.target.style.borderColor = error ? T.red : T.border; e.target.style.boxShadow = 'none'; }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0,
            }}
          >{show ? '🙈' : '👁️'}</button>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 11, color: T.red, display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠️ {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11, color: T.muted }}>{hint}</div>
      )}
    </div>
  );
}

// ── Forgot Password Screen ─────────────────────────────────────
function ForgotPassword({ onBack }) {
  const { theme: T } = useTheme();
  const [email, setEmail]     = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleReset = async () => {
    const err = validators.email(email);
    if (err) return setEmailErr(err);
    setEmailErr('');
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e) {
      setError(FIREBASE_ERRORS[e.code] || 'Could not send reset email. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeUp 0.3s ease both' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: T.primary,
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: "'DM Sans',sans-serif", marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 6, padding: 0,
      }}>← Back to login</button>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>
            Check your email!
          </div>
          <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>
            We sent a password reset link to<br/>
            <strong style={{ color: T.primary }}>{email}</strong>
          </div>
          <div style={{
            background: T.primaryBg, border: `1px solid ${T.primary}30`,
            borderRadius: 14, padding: '14px 16px', fontSize: 12, color: T.muted,
            textAlign: 'left', lineHeight: 1.8,
          }}>
            💡 Didn't get it? Check your spam folder.<br/>
            ⏱ Link expires in 1 hour.<br/>
            🔁 <span
              onClick={handleReset}
              style={{ color: T.primary, cursor: 'pointer', fontWeight: 700 }}>
              Send again
            </span>
          </div>
          <button onClick={onBack} style={{
            marginTop: 20, width: '100%', padding: '13px 0', borderRadius: 14,
            background: T.primary, color: '#fff', border: 'none',
            fontWeight: 800, fontSize: 14, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
          }}>Back to Sign In</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>
            Forgot Password? 🔑
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
            Enter your email and we'll send you a link to reset your password.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field
              label="EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={v => { setEmail(v); setEmailErr(''); }}
              error={emailErr}
              placeholder="your@email.com"
              icon="📧"
            />

            {error && (
              <div style={{
                background: T.redBg, border: `1px solid ${T.red}40`,
                borderRadius: 12, padding: '10px 14px', fontSize: 13, color: T.red,
              }}>⚠️ {error}</div>
            )}

            <button onClick={handleReset} disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 14,
              background: T.primary, color: '#fff', border: 'none',
              fontWeight: 800, fontSize: 14, cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}>
              {loading ? '⏳ Sending...' : 'Send Reset Email →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Login Component ───────────────────────────────────────
export default function Login() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const [mode, setMode]       = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [firebaseErr, setFirebaseErr] = useState('');

  // Sign in fields
  const [siEmail, setSiEmail]     = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siEmailErr, setSiEmailErr] = useState('');
  const [siPassErr, setSiPassErr]   = useState('');

  // Sign up fields
  const [suName, setSuName]       = useState('');
  const [suEmail, setSuEmail]     = useState('');
  const [suPhone, setSuPhone]     = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suRole, setSuRole]       = useState('customer');
  const [suNameErr, setSuNameErr]   = useState('');
  const [suEmailErr, setSuEmailErr] = useState('');
  const [suPhoneErr, setSuPhoneErr] = useState('');
  const [suPassErr, setSuPassErr]   = useState('');
  const [suConfirmErr, setSuConfirmErr] = useState('');

  const formatPhone = v => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0,4)} ${digits.slice(4)}`;
    return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7)}`;
  };

  const handleSignIn = async () => {
    const eErr = validators.email(siEmail);
    const pErr = siPassword ? null : 'Password is required';
    setSiEmailErr(eErr || '');
    setSiPassErr(pErr || '');
    if (eErr || pErr) return;

    setLoading(true);
    setFirebaseErr('');
    try {
      await signInWithEmailAndPassword(auth, siEmail.trim(), siPassword);
    } catch (e) {
      setFirebaseErr(FIREBASE_ERRORS[e.code] || 'Sign in failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    const nErr = validators.name(suName);
    const eErr = validators.email(suEmail);
    const phErr = validators.phone(suPhone);
    const pErr = validators.password(suPassword);
    const cErr = suConfirm !== suPassword ? 'Passwords do not match' : null;

    setSuNameErr(nErr || '');
    setSuEmailErr(eErr || '');
    setSuPhoneErr(phErr || '');
    setSuPassErr(pErr || '');
    setSuConfirmErr(cErr || '');
    if (nErr || eErr || phErr || pErr || cErr) return;

    setLoading(true);
    setFirebaseErr('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, suEmail.trim(), suPassword);
      await setDoc(doc(db, 'users', cred.user.uid), {
        name:      suName.trim(),
        email:     suEmail.trim().toLowerCase(),
        phone:     suPhone.replace(/\D/g, ''),
        role:      suRole,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      setFirebaseErr(FIREBASE_ERRORS[e.code] || 'Sign up failed. Please try again.');
    }
    setLoading(false);
  };

  const card = {
    background: T.card,
    borderRadius: 24,
    padding: '32px 28px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    border: `1px solid ${T.border}`,
    width: '100%',
    maxWidth: 420,
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: 16, right: 16,
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, width: 40, height: 40, cursor: 'pointer',
        fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>{isDark ? '☀️' : '🌙'}</button>

      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, animation: 'float 3s ease-in-out infinite' }}>🤝</div>
          <div style={{
            fontSize: 28, fontWeight: 900, fontFamily: "'Syne',sans-serif",
            background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px', marginTop: 4,
          }}>OnlyBuddy</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Hull's Errand & Grocery App</div>
        </div>

        {/* Forgot password screen */}
        {mode === 'forgot' && <ForgotPassword onBack={() => setMode('signin')} />}

        {/* Sign in / Sign up tabs */}
        {mode !== 'forgot' && (
          <>
            <div style={{
              display: 'flex', background: T.bg2,
              borderRadius: 14, padding: 4, marginBottom: 24,
              border: `1px solid ${T.border}`,
            }}>
              {['signin', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setFirebaseErr(''); }} style={{
                  flex: 1, padding: '9px 0', borderRadius: 11,
                  background: mode === m ? T.card : 'transparent',
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  color: mode === m ? T.primary : T.muted,
                  fontFamily: "'DM Sans',sans-serif",
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}>{m === 'signin' ? 'Sign In' : 'Create Account'}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ── SIGN IN ── */}
              {mode === 'signin' && (
                <>
                  <Field label="EMAIL ADDRESS" type="email"
                    value={siEmail} onChange={v => { setSiEmail(v); setSiEmailErr(''); }}
                    error={siEmailErr} placeholder="your@email.com" icon="📧" />
                  <Field label="PASSWORD" type="password"
                    value={siPassword} onChange={v => { setSiPassword(v); setSiPassErr(''); }}
                    error={siPassErr} placeholder="Your password" icon="🔒" />

                  <button
                    onClick={() => setMode('forgot')}
                    style={{
                      background: 'none', border: 'none', color: T.primary,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      textAlign: 'right', fontFamily: "'DM Sans',sans-serif",
                      padding: 0, alignSelf: 'flex-end', marginTop: -6,
                    }}>
                    Forgot password?
                  </button>
                </>
              )}

              {/* ── SIGN UP ── */}
              {mode === 'signup' && (
                <>
                  <Field label="FULL NAME" value={suName}
                    onChange={v => { setSuName(v); setSuNameErr(''); }}
                    error={suNameErr} placeholder="e.g. John Cena" icon="👤" />
                  <Field label="EMAIL ADDRESS" type="email" value={suEmail}
                    onChange={v => { setSuEmail(v); setSuEmailErr(''); }}
                    error={suEmailErr} placeholder="your@email.com" icon="📧" />
                  <Field label="PHONE NUMBER" type="tel" value={suPhone}
                    onChange={v => { setSuPhone(formatPhone(v)); setSuPhoneErr(''); }}
                    error={suPhoneErr} placeholder="07700 900 123" icon="📱"
                    hint="UK number — used for job updates" />
                  <Field label="PASSWORD" type="password" value={suPassword}
                    onChange={v => { setSuPassword(v); setSuPassErr(''); }}
                    error={suPassErr} placeholder="Min 6 chars, 1 uppercase, 1 number" icon="🔒"
                    hint="Must contain uppercase letter and number" />
                  <Field label="CONFIRM PASSWORD" type="password" value={suConfirm}
                    onChange={v => { setSuConfirm(v); setSuConfirmErr(''); }}
                    error={suConfirmErr} placeholder="Repeat your password" icon="🔒" />

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 0.8, marginBottom: 8 }}>
                      I AM A...
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { id: 'customer', icon: '🛒', label: 'Customer', desc: 'Book errands & deliveries' },
                        { id: 'buddy',    icon: '🏃', label: 'Buddy',    desc: 'Earn by completing jobs' },
                      ].map(r => (
                        <button key={r.id} onClick={() => setSuRole(r.id)} style={{
                          padding: '12px 10px', borderRadius: 14, cursor: 'pointer',
                          border: `2px solid ${suRole === r.id ? T.primary : T.border}`,
                          background: suRole === r.id ? T.primaryBg : T.card2,
                          transition: 'all 0.18s', textAlign: 'center',
                          fontFamily: "'DM Sans',sans-serif",
                        }}>
                          <div style={{ fontSize: 24 }}>{r.icon}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: suRole === r.id ? T.primary : T.text, marginTop: 4 }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Firebase error */}
              {firebaseErr && (
                <div style={{
                  background: T.redBg, border: `1.5px solid ${T.red}50`,
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 13, color: T.red,
                  display: 'flex', alignItems: 'center', gap: 8,
                  animation: 'fadeUp 0.2s ease',
                }}>⚠️ {firebaseErr}</div>
              )}

              {/* Submit button */}
              <button
                onClick={mode === 'signin' ? handleSignIn : handleSignUp}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 14,
                  background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`,
                  color: '#fff', border: 'none', fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 16px ${T.primary}40`,
                }}>
                {loading
                  ? '⏳ Please wait...'
                  : mode === 'signin' ? 'Sign In →' : 'Create My Account →'}
              </button>

              {mode === 'signup' && (
                <div style={{ fontSize: 11, color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
                  By creating an account you agree to our Terms of Service
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ERRAND_TYPES = [
  { id: 'grocery',  icon: '🛒', label: 'Grocery Run',       color: '#059669', base: 5.00, perMile: 1.00 },
  { id: 'buy',      icon: '🛍️', label: 'Buy & Deliver',      color: '#7C3AED', base: 6.00, perMile: 1.00 },
  { id: 'queue',    icon: '⏳', label: 'Queue for Me',        color: '#D97706', base: 10.00, per: '/hr'   },
  { id: 'parcel',   icon: '📦', label: 'Parcel & Returns',   color: '#2563EB', base: 5.00, perMile: 0.75 },
  { id: 'pharmacy', icon: '💊', label: 'Prescription Run',   color: '#DB2777', base: 5.00, flat: true    },
];

const PAYMENT_METHODS = [
  { id: 'stripe', icon: '💳', label: 'Card (Stripe)',  desc: 'Visa, Mastercard, Amex' },
  { id: 'paypal', icon: '🅿️', label: 'PayPal',         desc: 'Pay with your PayPal balance' },
];

// Replace with your actual Stripe publishable key
const STRIPE_PK = 'pk_test_YOUR_STRIPE_KEY_HERE';

export default function BookingPage() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [errand, setErrand] = useState(null);
  const [form, setForm] = useState({ description: '', address: '', postcode: '', notes: '', estimatedHours: '1' });
  const [payment, setPayment] = useState('stripe');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const estimatedTotal = errand
    ? errand.id === 'queue'
      ? errand.base * parseFloat(form.estimatedHours || 1)
      : errand.base
    : 0;

  const submitOrder = async () => {
    if (!form.description.trim()) { setError('Please describe your errand'); return; }
    if (!form.address.trim())     { setError('Please enter your delivery address'); return; }
    if (!form.postcode.trim())    { setError('Please enter your postcode'); return; }
    setError('');
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        errandType: errand.label,
        errandId: errand.id,
        description: form.description,
        address: form.address,
        postcode: form.postcode.toUpperCase(),
        notes: form.notes,
        estimatedHours: form.estimatedHours,
        total: estimatedTotal,
        paymentMethod: payment,
        status: 'pending',
        customerId: currentUser?.uid || 'guest',
        customerEmail: currentUser?.email || '',
        customerName: currentUser?.displayName || '',
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 24, padding: 48 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Syne', sans-serif", color: theme.green, marginBottom: 12 }}>Order Placed!</h2>
        <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.7, marginBottom: 8 }}>
          Your <strong style={{ color: theme.text }}>{errand?.label}</strong> request has been received. A verified Buddy will be matched shortly.
        </p>
        <div style={{ background: theme.bg2, borderRadius: 12, padding: '12px 20px', fontSize: 13, color: theme.muted, marginBottom: 24 }}>
          Order ID: <strong style={{ color: theme.text }}>{orderId.substring(0, 8).toUpperCase()}</strong>
        </div>
        <div style={{ background: theme.primaryBg, border: `1px solid ${theme.primary}33`, borderRadius: 14, padding: '18px 20px', textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.primary, marginBottom: 10 }}>What happens next:</div>
          {['⏱ A Buddy is being matched to your order', '📱 You\'ll receive a confirmation when matched', '📍 Track your Buddy live in the app', '💳 Payment taken only after delivery'].map(s => (
            <div key={s} style={{ fontSize: 13, color: theme.text2, marginBottom: 6 }}>{s}</div>
          ))}
        </div>
        <button onClick={() => { setStep(0); setErrand(null); setForm({ description: '', address: '', postcode: '', notes: '', estimatedHours: '1' }); setSubmitted(false); setOrderId(''); }} style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Book Another Errand
        </button>
      </div>
    </div>
  );

  const inputStyle = { width: '100%', background: theme.card2, border: `1.5px solid ${theme.border}`, borderRadius: 10, padding: '11px 14px', color: theme.text, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none', resize: 'vertical' };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Book a Buddy</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>Describe your errand — we'll match you with a verified local Buddy</p>
      </div>

      {!currentUser && (
        <div style={{ background: theme.accent + '22', border: `1px solid ${theme.accent}44`, padding: '12px 24px', textAlign: 'center', fontSize: 14, color: theme.text2 }}>
          💡 <Link to="/login" style={{ color: theme.primary, fontWeight: 700 }}>Sign in</Link> to track your orders and save your address. Or continue as a guest.
        </div>
      )}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Step 0: Choose errand */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>What do you need?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {ERRAND_TYPES.map(e => (
                <div key={e.id} onClick={() => { setErrand(e); setStep(1); }} style={{ background: theme.card, border: `2px solid ${errand?.id === e.id ? e.color : theme.border}`, borderRadius: 16, padding: 22, cursor: 'pointer', transition: 'all 0.18s', borderTop: `4px solid ${e.color}` }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{e.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{e.label}</div>
                  <div style={{ fontSize: 13, color: theme.primary, fontWeight: 700, marginTop: 6 }}>from £{e.base.toFixed(2)}</div>
                  {e.flat && <div style={{ fontSize: 11, color: theme.green, marginTop: 2 }}>Flat rate</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Describe + address */}
        {step === 1 && errand && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <button onClick={() => setStep(0)} style={{ background: theme.bg2, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: theme.text2, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
              <div style={{ fontSize: 22, fontWeight: 900, color: errand.color }}>{errand.icon} {errand.label}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Describe Your Errand *</label>
              <textarea style={{ ...inputStyle, minHeight: 100 }} rows={4} placeholder={errand.id === 'grocery' ? 'e.g. Semi-skimmed milk x2, bread, bananas, tin of beans from Tesco Express...' : errand.id === 'pharmacy' ? 'e.g. Collect prescription for John Smith from Boots on Prospect Street. Prescription should be ready.' : errand.id === 'queue' ? 'e.g. Hold my place in the Post Office queue on Jameson Street from 10am...' : 'Describe what you need done...'} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            {errand.id === 'queue' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Estimated Hours</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['0.5', '1', '1.5', '2', '3'].map(h => (
                    <button key={h} onClick={() => set('estimatedHours', h)} style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${form.estimatedHours === h ? errand.color : theme.border}`, background: form.estimatedHours === h ? errand.color + '22' : theme.card2, color: form.estimatedHours === h ? errand.color : theme.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{h}hr</button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Your Delivery Address *</label>
              <input style={inputStyle} placeholder="e.g. 14 Newland Avenue" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Postcode *</label>
              <input style={inputStyle} placeholder="e.g. HU5 2RQ" value={form.postcode} onChange={e => set('postcode', e.target.value.toUpperCase())} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Additional Notes (optional)</label>
              <textarea style={{ ...inputStyle, minHeight: 70 }} rows={2} placeholder="e.g. Leave at the door, ring bell twice, access code 1234..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <button onClick={() => {
              if (!form.description.trim()) { setError('Please describe your errand'); return; }
              if (!form.address.trim())     { setError('Please enter your delivery address'); return; }
              if (!form.postcode.trim())    { setError('Please enter your postcode'); return; }
              setError(''); setStep(2);
            }} style={{ padding: '14px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Continue to Payment →
            </button>
            {error && <div style={{ background: theme.redBg, border: `1px solid ${theme.red}44`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: theme.red }}>{error}</div>}
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && errand && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <button onClick={() => setStep(1)} style={{ background: theme.bg2, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: theme.text2, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Review & Pay</div>
            </div>

            {/* Order summary */}
            <div style={{ background: theme.bg2, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Order Summary</div>
              {[
                ['Errand', `${errand.icon} ${errand.label}`],
                ['Address', `${form.address}, ${form.postcode}`],
                ['Description', form.description.substring(0, 80) + (form.description.length > 80 ? '...' : '')],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ color: theme.muted }}>{k}</span>
                  <span style={{ color: theme.text, maxWidth: 300, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>Estimated Total</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: theme.primary }}>£{estimatedTotal.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>💳 Payment only taken after errand is completed</div>
            </div>

            {/* Payment method */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Method</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {PAYMENT_METHODS.map(p => (
                  <div key={p.id} onClick={() => setPayment(p.id)} style={{ flex: 1, background: theme.card, border: `2px solid ${payment === p.id ? theme.primary : theme.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.18s', background: payment === p.id ? theme.primaryBg : theme.card }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: payment === p.id ? theme.primary : theme.text }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: theme.muted }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: theme.primaryBg, border: `1px solid ${theme.primary}33`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: theme.text2 }}>
              🔒 Secure payment via {payment === 'stripe' ? 'Stripe' : 'PayPal'}. Your card details are never stored on our servers.
            </div>

            {error && <div style={{ background: theme.redBg, border: `1px solid ${theme.red}44`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: theme.red }}>{error}</div>}

            <button onClick={submitOrder} disabled={submitting} style={{ padding: '16px', borderRadius: 12, border: 'none', background: submitting ? theme.muted : `linear-gradient(135deg, ${theme.green}, #047857)`, color: '#fff', fontSize: 16, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: submitting ? 'none' : `0 4px 20px ${theme.green}44` }}>
              {submitting ? '⏳ Placing Order...' : `🚀 Confirm & Place Order — £${estimatedTotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

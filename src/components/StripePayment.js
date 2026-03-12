import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { showToast } from './Toast';

const STRIPE_PUBLIC = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

function loadStripe() {
  return new Promise((resolve, reject) => {
    if (window.Stripe) return resolve(window.Stripe(STRIPE_PUBLIC));
    if (!STRIPE_PUBLIC || STRIPE_PUBLIC.startsWith('YOUR')) return reject(new Error('NO_KEY'));
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload  = () => resolve(window.Stripe(STRIPE_PUBLIC));
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function StripePayment({ amount, jobId, customerEmail, onSuccess, onCancel }) {
  const { theme: T, isDark } = useTheme();
  const mountRef        = useRef(null);
  const [stripe, setStripe]         = useState(null);
  const [elements, setElements]     = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState(null);
  const [noKey, setNoKey]           = useState(false);
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    loadStripe().then(async (str) => {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, jobId, customerEmail }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const els = str.elements({
        clientSecret: json.clientSecret,
        appearance: {
          theme: isDark ? 'night' : 'stripe',
          variables: {
            colorPrimary:    isDark ? '#A78BFA' : '#6366F1',
            colorBackground: isDark ? '#0D1117'  : '#FFFFFF',
            colorText:       isDark ? '#E6EDF3'  : '#0F172A',
            borderRadius:    '12px',
            fontFamily:      'Inter, sans-serif',
          },
        },
      });

      const card = els.create('payment');
      card.mount(mountRef.current);
      card.on('ready', () => setReady(true));
      setStripe(str);
      setElements(els);
    }).catch(e => {
      if (e.message === 'NO_KEY') setNoKey(true);
      else setError(e.message);
    });
  }, [amount, jobId, customerEmail]); // eslint-disable-line

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    });
    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      showToast(`Payment of £${amount.toFixed(2)} confirmed! 💳`, 'success');
      onSuccess?.();
    }
  };

  if (noKey) return (
    <div style={{
      background: T.card2, border: `1.5px dashed ${T.border}`,
      borderRadius: 16, padding: 28, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: "'Syne',sans-serif" }}>
        Stripe Payments Ready
      </div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.7 }}>
        Add <code style={{ background: T.bg2, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>REACT_APP_STRIPE_PUBLIC_KEY</code> and <code style={{ background: T.bg2, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>STRIPE_SECRET_KEY</code> to Vercel environment variables
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: T.primaryBg, border: `1.5px solid ${T.primary}30`,
        borderRadius: 14, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Total to pay</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: T.primary, fontFamily: "'Syne',sans-serif" }}>
          £{amount.toFixed(2)}
        </div>
      </div>

      {/* Stripe mounts into this div via ref */}
      <div ref={mountRef} style={{
        background: T.card2, border: `1.5px solid ${T.border}`,
        borderRadius: 12, padding: '14px 16px',
        minHeight: 60,
      }} />

      {!ready && !error && (
        <div style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>
          Loading card form...
        </div>
      )}

      {error && (
        <div style={{
          background: T.redBg, border: `1px solid ${T.red}40`,
          borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.red,
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handlePay} disabled={processing || !ready} style={{
          flex: 1, padding: '13px 0', borderRadius: 14,
          background: T.primary, color: '#fff', border: 'none',
          fontWeight: 800, fontSize: 14,
          cursor: processing || !ready ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans',sans-serif",
          opacity: processing || !ready ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}>
          {processing ? '⏳ Processing...' : `Pay £${amount.toFixed(2)}`}
        </button>
        <button onClick={onCancel} style={{
          padding: '13px 18px', borderRadius: 14,
          background: T.bg2, border: `1px solid ${T.border}`,
          color: T.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif",
        }}>Cancel</button>
      </div>

      <div style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>
        🔒 Secured by Stripe · You won't be charged until delivery
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
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
  const { theme: T } = useTheme();
  const [stripe, setStripe]         = useState(null);
  const [elements, setElements]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState(null);
  const [noKey, setNoKey]           = useState(false);

  useEffect(() => {
    loadStripe().then(async (str) => {
      // Get payment intent from our serverless function
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, jobId, customerEmail }),
      });
      const { clientSecret, error } = await res.json();
      if (error) throw new Error(error);

      const els = str.elements({ clientSecret, appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#6D28D9',
          colorBackground: T.card,
          colorText: T.text,
          borderRadius: '12px',
          fontFamily: 'DM Sans, sans-serif',
        },
      }});

      const card = els.create('payment');
      card.mount('#ob-stripe-element');
      setStripe(str);
      setElements(els);
      setLoading(false);
    }).catch(e => {
      setLoading(false);
      if (e.message === 'NO_KEY') setNoKey(true);
      else setError(e.message);
    });
  }, [amount, jobId, customerEmail, T]);

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
        Add these to Vercel environment variables:<br/>
        <code style={{ background: T.bg2, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>REACT_APP_STRIPE_PUBLIC_KEY</code><br/>
        <code style={{ background: T.bg2, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>STRIPE_SECRET_KEY</code>
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

      {loading ? (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 13 }}>
          Loading card form...
        </div>
      ) : (
        <div id="ob-stripe-element" style={{
          background: T.card2, border: `1.5px solid ${T.border}`,
          borderRadius: 12, padding: '14px 16px',
        }} />
      )}

      {error && (
        <div style={{
          background: T.redBg, border: `1px solid ${T.red}40`,
          borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.red,
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handlePay} disabled={processing || loading} style={{
          flex: 1, padding: '13px 0', borderRadius: 14,
          background: T.primary, color: '#fff', border: 'none',
          fontWeight: 800, fontSize: 14, cursor: processing ? 'wait' : 'pointer',
          fontFamily: "'DM Sans',sans-serif",
          opacity: processing ? 0.7 : 1,
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

      <div style={{ fontSize: 11, color: T.muted, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        🔒 Secured by Stripe · You won't be charged until delivery
      </div>
    </div>
  );
}

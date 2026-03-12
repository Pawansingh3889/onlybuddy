import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

const ERRAND_TYPES = [
  { icon: '🛒', label: 'Grocery Run',      color: '#059669', desc: 'Any Hull supermarket or local shop — we collect and deliver' },
  { icon: '🛍️', label: 'Buy & Deliver',     color: '#7C3AED', desc: 'Send a Buddy to any shop in Hull to pick up anything you need' },
  { icon: '⏳', label: 'Queue for Me',       color: '#D97706', desc: 'Hold your spot in any queue — council, NHS walk-in, Post Office' },
  { icon: '📦', label: 'Parcel & Returns',  color: '#2563EB', desc: 'Collect or drop off parcels, ASOS returns, Amazon pickups' },
  { icon: '💊', label: 'Prescription Run',  color: '#DB2777', desc: 'Collect NHS or private prescriptions from any Hull pharmacy' },
];

const STEPS = [
  { step: '01', icon: '📋', title: 'Describe Your Errand', desc: 'Tell us what you need done — shop, collect, queue, or deliver. Takes 60 seconds.' },
  { step: '02', icon: '🤝', title: 'Match With a Buddy',   desc: 'A verified, DBS-checked Buddy nearby accepts your request within minutes.' },
  { step: '03', icon: '📍', title: 'Live Tracking',        desc: 'Watch your Buddy in real time on the map. Chat directly if needed.' },
  { step: '04', icon: '✅', title: 'Done & Delivered',     desc: 'Pay securely by card or PayPal. Rate your Buddy and that\'s it!' },
];

const TRUST_BADGES = [
  { icon: '🔍', label: 'DBS Checked',       desc: 'Every Buddy passes an official DBS background check before their first job' },
  { icon: '🪪', label: 'ID Verified',        desc: 'Photo ID and selfie verified for every Buddy on the platform' },
  { icon: '🛡️', label: 'Fully Insured',      desc: 'All deliveries covered by public liability and goods in transit insurance' },
  { icon: '⭐', label: 'Rated & Reviewed',   desc: 'Buddies below 4.0 stars are automatically suspended pending review' },
  { icon: '📍', label: 'Live GPS Tracking',  desc: 'Track your Buddy in real time for every single order' },
  { icon: '💬', label: 'In-App Chat Only',   desc: 'All communication through the app — your personal number is never shared' },
];

export default function HomePage() {
  const { theme, isDark } = useTheme();
  const [buddyCount, setBuddyCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'buddy'), where('status', '==', 'approved'));
    getCountFromServer(q).then(snap => setBuddyCount(snap.data().count)).catch(() => setBuddyCount(0));
  }, []);

  useEffect(() => {
    getCountFromServer(collection(db, 'orders')).then(snap => setOrderCount(snap.data().count)).catch(() => setOrderCount(0));
  }, []);

  // ── Gradients that ACTUALLY change between light/dark
  const heroGradient   = isDark
    ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 45%, #4C1D95 100%)'
    : `linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 50%, #8B5CF6 100%)`;

  const ctaGradient    = isDark
    ? 'linear-gradient(135deg, #1E1B4B, #312E81)'
    : `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`;

  return (
    <div style={{ background: theme.bg, overflowX: 'hidden', width: '100%' }}>
      <style>{`
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hero-btn:hover   { opacity:0.88; transform:translateY(-2px); }
        .errand-card:hover{ transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.15); }
        .trust-card:hover { transform:translateY(-2px); }

        /* ── GLOBAL OVERFLOW FIX ── */
        *, *::before, *::after { box-sizing: border-box; }
        body, html { overflow-x: hidden; max-width: 100%; }

        /* ── MOBILE FIXES ── */
        @media (max-width: 640px) {
          .cta-grid    { grid-template-columns: 1fr !important; text-align: center; }
          .cta-btn     { width: 100% !important; }
          .hero-floater{ display: none !important; }
          .stats-row   { gap: 16px !important; }
          .stat-item   { min-width: 0 !important; }
        }
        @media (max-width: 480px) {
          .hero-btns   { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns a { text-align: center !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: heroGradient, padding: 'clamp(48px, 10vw, 100px) 20px', textAlign: 'center', position: 'relative', overflow: 'hidden', width: '100%' }}>
        {/* Floating emojis — hidden on mobile via CSS */}
        <div className="hero-floater" style={{ position: 'absolute', top: 24, left: '8%', fontSize: 56, opacity: 0.1, animation: 'float 4s infinite', pointerEvents: 'none' }}>🛒</div>
        <div className="hero-floater" style={{ position: 'absolute', bottom: 32, right: '6%', fontSize: 72, opacity: 0.1, animation: 'float 5s infinite 1s', pointerEvents: 'none' }}>🤝</div>
        <div className="hero-floater" style={{ position: 'absolute', top: 48, right: '18%', fontSize: 48, opacity: 0.1, animation: 'float 3.5s infinite 0.5s', pointerEvents: 'none' }}>📦</div>

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', width: '100%' }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, backdropFilter: 'blur(8px)', maxWidth: '100%' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', animation: 'pulse 2s infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {buddyCount > 0 ? `${buddyCount} Verified Buddies Ready` : 'Now Live in Hull'} · Free to Book
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 8vw, 68px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1.1, marginBottom: 20, wordBreak: 'break-word' }}>
            Hull's Errand App.<br />
            <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)' }}>Done in 30 Minutes.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px', padding: '0 4px' }}>
            Groceries, errands, prescriptions, queues — send a verified local Buddy to handle it while you get on with your day.
          </p>

          {/* CTA buttons */}
          <div className="hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 8px' }}>
            <Link to="/book" className="hero-btn" style={{ textDecoration: 'none', background: '#fff', color: theme.primaryDark, padding: '15px 32px', borderRadius: 14, fontSize: 16, fontWeight: 800, transition: 'all 0.2s', display: 'inline-block', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
              Book a Buddy →
            </Link>
            <Link to="/apply" className="hero-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '15px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, border: '2px solid rgba(255,255,255,0.35)', transition: 'all 0.2s', display: 'inline-block', backdropFilter: 'blur(8px)', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
              Earn as a Buddy
            </Link>
          </div>

          {/* Stats row */}
          <div className="stats-row" style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap', padding: '0 8px' }}>
            {[
              [`${orderCount > 0 ? orderCount + '+' : '100+'}`, 'Orders Done'],
              [buddyCount > 0 ? buddyCount + '+' : 'Growing', 'Verified Buddies'],
              ['All Hull', 'HU1–HU17'],
              ['30 Min', 'Avg Delivery'],
            ].map(([val, label]) => (
              <div key={label} className="stat-item" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ERRAND TYPES ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>What We Do</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, color: theme.text, fontFamily: "'Outfit', sans-serif" }}>Every Errand Covered</h2>
          <p style={{ fontSize: 15, color: theme.muted, marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>From a pint of milk to a full weekly shop — if it needs doing in Hull, we'll send a Buddy.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {ERRAND_TYPES.map(e => (
            <div key={e.label} className="errand-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 'clamp(16px, 4vw, 28px)', borderTop: `4px solid ${e.color}`, transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => window.location.href='/book'}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{e.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>{e.label}</div>
              <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6 }}>{e.desc}</div>
              <div style={{ marginTop: 14, fontSize: 13, color: e.color, fontWeight: 700 }}>Book now →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, width: '100%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, color: theme.text, fontFamily: "'Outfit', sans-serif" }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28 }}>
            {STEPS.map(s => (
              <div key={s.step}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: isDark ? 'linear-gradient(135deg, #312E81, #4338CA)' : `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: theme.primary, letterSpacing: 1 }}>STEP {s.step}</div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: theme.text, fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST & SAFETY ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.green, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Safety First</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, color: theme.text, fontFamily: "'Outfit', sans-serif" }}>Why You Can Trust Your Buddy</h2>
          <p style={{ fontSize: 15, color: theme.muted, marginTop: 10, maxWidth: 520, margin: '10px auto 0' }}>Every Buddy goes through our full verification before their first job.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {TRUST_BADGES.map(b => (
            <div key={b.label} className="trust-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '20px 22px', display: 'flex', gap: 14, transition: 'all 0.2s' }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUDDY CTA BANNER ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px clamp(48px, 8vw, 80px)', width: '100%' }}>
        <div className="cta-grid" style={{ background: ctaGradient, borderRadius: 24, padding: 'clamp(32px, 6vw, 60px) clamp(24px, 5vw, 48px)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Join the Team</div>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Earn £10–£18/hr as a Buddy</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, maxWidth: 440 }}>
              Set your own hours, get paid weekly. Hull's fastest growing gig platform.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {['✓ Your own hours', '✓ Weekly pay', '✓ Bike, car or foot', '✓ Free to join'].map(f => (
                <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{f}</div>
              ))}
            </div>
          </div>
          <Link to="/apply" className="cta-btn hero-btn" style={{ textDecoration: 'none', background: '#fff', color: theme.primaryDark, padding: '16px 32px', borderRadius: 14, fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif", display: 'block', textAlign: 'center', transition: 'all 0.2s' }}>
            Apply Now →
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const ERRAND_TYPES = [
  { icon: '🛒', label: 'Grocery Run',       color: '#059669', desc: 'Any Hull supermarket or local shop — we collect and deliver' },
  { icon: '🛍️', label: 'Buy & Deliver',      color: '#7C3AED', desc: 'Send a Buddy to any shop in Hull to pick up anything you need' },
  { icon: '⏳', label: 'Queue for Me',        color: '#D97706', desc: 'Hold your spot in any queue — council, NHS walk-in, Post Office' },
  { icon: '📦', label: 'Parcel & Returns',    color: '#2563EB', desc: 'Collect or drop off parcels, ASOS returns, Amazon pickups' },
  { icon: '💊', label: 'Prescription Run',    color: '#DB2777', desc: 'Collect NHS or private prescriptions from any Hull pharmacy' },
];

const STEPS = [
  { step: '01', icon: '📋', title: 'Describe Your Errand', desc: 'Tell us what you need done — shop, collect, queue, or deliver. Takes 60 seconds.' },
  { step: '02', icon: '🤝', title: 'Match With a Buddy',   desc: 'A verified, DBS-checked Buddy nearby accepts your request within minutes.' },
  { step: '03', icon: '📍', title: 'Live Tracking',        desc: 'Watch your Buddy in real time on the map. Chat directly if needed.' },
  { step: '04', icon: '✅', title: 'Done & Delivered',     desc: 'Pay securely by card or PayPal. Rate your Buddy and that\'s it!' },
];

const TRUST_BADGES = [
  { icon: '🔍', label: 'DBS Checked',      desc: 'Every Buddy passes an official DBS background check before their first job' },
  { icon: '🪪', label: 'ID Verified',       desc: 'Photo ID and selfie verified for every Buddy on the platform' },
  { icon: '🛡️', label: 'Fully Insured',     desc: 'All deliveries covered by public liability and goods in transit insurance' },
  { icon: '⭐', label: 'Rated & Reviewed',  desc: 'Buddies below 4.0 stars are automatically suspended pending review' },
  { icon: '📍', label: 'Live GPS Tracking', desc: 'Track your Buddy in real time for every single order' },
  { icon: '💬', label: 'In-App Chat Only',  desc: 'All communication through the app — your personal number is never shared' },
];

export default function HomePage() {
  const { theme } = useTheme();
  const [buddyCount, setBuddyCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    // Live buddy count from Firestore
    const q = query(collection(db, 'users'), where('role', '==', 'buddy'), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, snap => setBuddyCount(snap.size));
    return unsub;
  }, []);

  useEffect(() => {
    // Live order count
    const q = query(collection(db, 'orders'));
    const unsub = onSnapshot(q, snap => setOrderCount(snap.size));
    return unsub;
  }, []);

  return (
    <div style={{ background: theme.bg }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        .hero-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .errand-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
        .trust-card:hover { transform: translateY(-2px); }
        section { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 50%, #8B5CF6 100%)`, padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 20, left: '10%', fontSize: 60, opacity: 0.08, animation: 'float 4s infinite' }}>🛒</div>
        <div style={{ position: 'absolute', bottom: 30, right: '8%', fontSize: 80, opacity: 0.08, animation: 'float 5s infinite 1s' }}>🤝</div>
        <div style={{ position: 'absolute', top: 40, right: '20%', fontSize: 50, opacity: 0.08, animation: 'float 3.5s infinite 0.5s' }}>📦</div>

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{buddyCount > 0 ? `${buddyCount} Verified Buddies Ready` : 'Now Live in Hull'} · Free to Book</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", lineHeight: 1.1, marginBottom: 20 }}>
            Hull's Errand App.<br />
            <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)' }}>Done in 30 Minutes.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Groceries, errands, prescriptions, queues — send a verified local Buddy to handle it while you get on with your day.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" className="hero-btn" style={{ textDecoration: 'none', background: '#fff', color: theme.primary, padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 800, transition: 'all 0.2s', display: 'inline-block', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Book a Buddy →
            </Link>
            <Link to="/apply" className="hero-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700, border: '2px solid rgba(255,255,255,0.4)', transition: 'all 0.2s', display: 'inline-block', backdropFilter: 'blur(8px)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Earn as a Buddy
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {[
              [`${orderCount > 0 ? orderCount + '+' : '100+'}`, 'Orders Completed'],
              [buddyCount > 0 ? buddyCount + '+' : 'Growing', 'Verified Buddies'],
              ['All Hull', 'Postcodes Covered'],
              ['30 Min', 'Average Delivery'],
            ].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif" }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ERRAND TYPES ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>What We Do</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: theme.text, fontFamily: "'Syne', sans-serif" }}>Every Errand Covered</h2>
          <p style={{ fontSize: 16, color: theme.muted, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>From a pint of milk to a full weekly shop — if it needs doing in Hull, we'll send a Buddy.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {ERRAND_TYPES.map(e => (
            <div key={e.label} className="errand-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 28, borderTop: `4px solid ${e.color}`, transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => window.location.href='/book'}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{e.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>{e.label}</div>
              <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.6 }}>{e.desc}</div>
              <div style={{ marginTop: 16, fontSize: 13, color: e.color, fontWeight: 700 }}>Book now →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: theme.text, fontFamily: "'Syne', sans-serif" }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.step} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: theme.primary, letterSpacing: 1 }}>STEP {s.step}</div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7 }}>{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', right: -16, top: 24, fontSize: 20, color: theme.border, display: 'none' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST & SAFETY ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.green, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Your Safety Comes First</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: theme.text, fontFamily: "'Syne', sans-serif" }}>Why You Can Trust Your Buddy</h2>
          <p style={{ fontSize: 16, color: theme.muted, marginTop: 12, maxWidth: 560, margin: '12px auto 0' }}>Every single Buddy on OnlyBuddy goes through our rigorous verification process before taking their first job.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {TRUST_BADGES.map(b => (
            <div key={b.label} className="trust-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, display: 'flex', gap: 16, transition: 'all 0.2s' }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>{b.label}</div>
                <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUDDY CTA ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, borderRadius: 28, padding: '60px 48px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Join the Team</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>Earn £10–£18/hr as a Buddy</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: 480 }}>
              Set your own hours, work around your schedule, and get paid weekly. Hull's fastest growing gig platform is looking for reliable, friendly people.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {['✓ Set your own hours', '✓ Weekly bank transfers', '✓ Work on foot, bike or car', '✓ Free to join'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{f}</div>
              ))}
            </div>
          </div>
          <Link to="/apply" style={{ textDecoration: 'none', background: '#fff', color: theme.primary, padding: '18px 36px', borderRadius: 14, fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'block', textAlign: 'center' }}>
            Apply to Be a Buddy →
          </Link>
        </div>
      </section>
    </div>
  );
}

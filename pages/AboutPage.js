import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const STEPS = [
  { step: '01', icon: '📋', title: 'Describe Your Errand', desc: 'Tell us what you need — groceries, a prescription, a queue, or a parcel. Takes 60 seconds to book.' },
  { step: '02', icon: '🤝', title: 'Match With a Buddy',   desc: 'A verified, DBS-checked Buddy near you gets notified and accepts your request.' },
  { step: '03', icon: '📍', title: 'Real-Time Tracking',   desc: 'Watch your Buddy on the live map. Chat with them directly through the app.' },
  { step: '04', icon: '✅', title: 'Delivered & Done',     desc: 'Pay securely by card or PayPal when it\'s done. Rate your Buddy — that\'s it!' },
];

const TIERS = [
  { icon: '🌱', tier: 'New Buddy',     color: '#D97706', bg: '#FEF3C7', steps: ['ID verified', 'Selfie verified', 'Application approved', 'Max order: £20'], desc: 'New Buddies start with small errands to build their track record.' },
  { icon: '⭐', tier: 'Trusted Buddy', color: '#2563EB', bg: '#DBEAFE', steps: ['10+ completed orders', '4.5★ minimum rating', 'Max order: £50'],         desc: 'Trusted Buddies have proven themselves through real jobs and reviews.' },
  { icon: '🏆', tier: 'Top Buddy',     color: '#059669', bg: '#D1FAE5', steps: ['50+ orders', 'DBS check submitted', 'Unlimited order value'],            desc: 'Top Buddies are fully vetted and trusted for any task, any value.' },
];

export default function AboutPage() {
  const { theme, isDark } = useTheme();

  const heroGradient = isDark
    ? 'linear-gradient(135deg, #0D0720 0%, #1A0F2E 45%, #2D1B4E 100%)'
    : `linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 50%, #8B5CF6 100%)`;

  return (
    <div style={{ background: theme.bg, overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @media (max-width: 600px) {
          .about-steps-grid { grid-template-columns: 1fr !important; }
          .about-tiers-grid { grid-template-columns: 1fr !important; }
          .about-cta-grid   { grid-template-columns: 1fr !important; }
          .about-story-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: heroGradient, padding: 'clamp(48px, 10vw, 80px) 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>About OnlyBuddy</div>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: 14, lineHeight: 1.2 }}>
          Hull's Errand App
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.82)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Built in Hull, for Hull. We connect busy people with trusted local Buddies who handle the everyday stuff.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px, 8vw, 70px) 20px' }}>

        {/* Story */}
        <div className="about-story-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', marginBottom: 72 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Our Story</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 16, color: theme.text, lineHeight: 1.3 }}>Built Right Here in Hull</h2>
            <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.8, marginBottom: 14 }}>
              OnlyBuddy was born from a simple idea — what if you could send a trusted local person to do the things that eat up your day? Queuing at the Post Office. Picking up a prescription. Grabbing the weekly shop.
            </p>
            <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.8 }}>
              We built it for Hull because Hull deserves it. A tight-knit community where the gig economy can actually work for the people who live here.
            </p>
          </div>
          <div style={{ background: isDark ? theme.primaryBg : '#EEF2FF', borderRadius: 24, padding: 40, textAlign: 'center', border: `1px solid ${theme.primary}22` }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🤝</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.primary, marginBottom: 8 }}>Community First</div>
            <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7 }}>Every Buddy is a local Hull resident. Every order supports the local economy.</div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>The Process</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text, lineHeight: 1.3 }}>How OnlyBuddy Works</h2>
        </div>

        {/* FIXED: 2x2 grid so step 4 never orphans */}
        <div className="about-steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 72 }}>
          {STEPS.map(s => (
            <div key={s.step} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 'clamp(18px, 4vw, 28px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: isDark ? theme.primaryBg : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `1px solid ${theme.primary}22` }}>{s.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: theme.primary, letterSpacing: 1.5, textTransform: 'uppercase' }}>Step {s.step}</div>
              </div>
              <div style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: theme.text, marginBottom: 8, lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Tier system */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 'clamp(28px, 5vw, 48px)', marginBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.green, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Safety First</div>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text, lineHeight: 1.3 }}>The Buddy Trust System</h2>
            <p style={{ fontSize: 14, color: theme.muted, marginTop: 10, maxWidth: 500, margin: '10px auto 0', lineHeight: 1.7 }}>Every Buddy earns trust through real jobs and verified checks before handling bigger orders.</p>
          </div>
          <div className="about-tiers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {TIERS.map(t => (
              <div key={t.tier} style={{ background: theme.bg2, borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)', textAlign: 'center', border: `1.5px solid ${t.color}33` }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: isDark ? t.color + '22' : t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px' }}>{t.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.color, fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>{t.tier}</div>
                {t.steps.map(s => <div key={s} style={{ fontSize: 12, color: theme.text2, marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><span style={{ color: t.color }}>✓</span>{s}</div>)}
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 12, lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="about-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Link to="/book" style={{ textDecoration: 'none', background: isDark ? 'linear-gradient(135deg, #1A0F2E, #2D1B4E)' : `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, borderRadius: 20, padding: 'clamp(24px, 4vw, 36px) 24px', textAlign: 'center', display: 'block', border: `1px solid ${theme.primary}44` }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🛒</div>
            <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Book an Errand</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Done in 30 minutes →</div>
          </Link>
          <Link to="/apply" style={{ textDecoration: 'none', background: theme.card, border: `2px solid ${theme.primary}`, borderRadius: 20, padding: 'clamp(24px, 4vw, 36px) 24px', textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🏃</div>
            <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: theme.primary, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>Become a Buddy</div>
            <div style={{ fontSize: 13, color: theme.muted }}>Earn £10–£18/hr in Hull →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

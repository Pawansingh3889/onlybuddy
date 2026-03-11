import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutPage() {
  const { theme } = useTheme();
  return (
    <div style={{ background: theme.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Hull's Errand App</h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto' }}>Built in Hull, for Hull. We connect busy people with trusted local Buddies who handle the everyday stuff.</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>

        {/* Story */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 80 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Our Story</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Built Right Here in Hull</h2>
            <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.8, marginBottom: 16 }}>
              OnlyBuddy was born out of a simple idea: what if you could send a trusted local person to do the things that eat up your day? Queuing at the Post Office. Picking up a prescription. Grabbing the weekly shop.
            </p>
            <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.8 }}>
              We built it for Hull because Hull deserves it — a tight community, a city that looks after its own, and a place where the gig economy can actually work for the people who live here.
            </p>
          </div>
          <div style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.primaryBg})`, borderRadius: 24, padding: 40, textAlign: 'center', border: `1px solid ${theme.primary}33` }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤝</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Syne', sans-serif", color: theme.primary }}>Community First</div>
            <div style={{ fontSize: 14, color: theme.muted, marginTop: 8, lineHeight: 1.6 }}>Every Buddy is a local Hull resident. Every order supports the local economy.</div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>The Process</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, fontFamily: "'Syne', sans-serif" }}>How OnlyBuddy Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 80 }}>
          {[
            { icon: '📋', step: '01', title: 'Describe Your Errand', desc: 'Tell us what you need — groceries, a prescription, a queue, or a parcel. Takes 60 seconds to book.' },
            { icon: '🤝', step: '02', title: 'Match With a Buddy',   desc: 'A verified, DBS-checked Buddy near you gets notified and accepts your request.' },
            { icon: '📍', step: '03', title: 'Real-Time Tracking',   desc: 'Watch your Buddy on the live map. Chat with them directly through the app.' },
            { icon: '✅', step: '04', title: 'Delivered & Done',     desc: 'Pay securely by card or PayPal when it\'s done. Rate your Buddy and that\'s it!' },
          ].map(s => (
            <div key={s.step} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: theme.primary, letterSpacing: 1 }}>STEP {s.step}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Trust section */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 24, padding: '48px 36px', marginBottom: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.green, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Safety First</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, fontFamily: "'Syne', sans-serif" }}>The Trust System</h2>
            <p style={{ fontSize: 15, color: theme.muted, marginTop: 12, maxWidth: 540, margin: '12px auto 0' }}>We don't take shortcuts on safety. Every Buddy goes through a rigorous process before handling their first order.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🌱', tier: 'New Buddy',     color: '#D97706', steps: ['ID verified', 'Selfie verified', 'Application approved', 'Max order: £20'], desc: 'New Buddies start with small errands to build their track record.' },
              { icon: '⭐', tier: 'Trusted Buddy',  color: '#2563EB', steps: ['10+ completed orders', '4.5★ minimum rating', 'Max order: £50'],         desc: 'Trusted Buddies have proven themselves through real orders and reviews.' },
              { icon: '🏆', tier: 'Top Buddy',      color: '#059669', steps: ['50+ orders', 'DBS check submitted', 'Unlimited order value'],            desc: 'Our top Buddies are fully checked and trusted for any task, any value.' },
            ].map(t => (
              <div key={t.tier} style={{ background: theme.bg2, borderRadius: 16, padding: 24, textAlign: 'center', border: `2px solid ${t.color}22` }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.color, fontFamily: "'Syne', sans-serif", marginBottom: 10 }}>{t.tier}</div>
                {t.steps.map(s => <div key={s} style={{ fontSize: 12, color: theme.text2, marginBottom: 4 }}>✓ {s}</div>)}
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 10, lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link to="/book" style={{ textDecoration: 'none', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, borderRadius: 20, padding: '36px 28px', textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Book an Errand</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Get it done in 30 minutes →</div>
          </Link>
          <Link to="/apply" style={{ textDecoration: 'none', background: theme.card, border: `2px solid ${theme.primary}`, borderRadius: 20, padding: '36px 28px', textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏃</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Become a Buddy</div>
            <div style={{ fontSize: 14, color: theme.muted }}>Earn £10–£18/hr in Hull →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

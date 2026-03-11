import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────
// 🔧 FILL THESE IN BEFORE GOING LIVE:
// ─────────────────────────────────────────────────────────
const META_PIXEL_ID    = '000000000000000'    // ⚠️ GET FROM Meta Ads Manager → Events Manager;       // Facebook Ads Manager → Events Manager
const TIKTOK_PIXEL_ID  = 'C0000000000000000'  // ⚠️ GET FROM TikTok Ads Manager → Assets → Events;     // TikTok Ads Manager → Assets → Events
const SNAPCHAT_PIXEL_ID = 'a0000000-0000-0000-0000-000000000000' // ⚠️ GET FROM Snapchat Ads Manager → Events;  // Snapchat Ads Manager → Events Manager
// ─────────────────────────────────────────────────────────

// Fire tracking pixels on page load + on form submit
const firePixels = (event = 'PageView', data = {}) => {
  try {
    // Meta
    if (window.fbq) window.fbq('track', event, data);
    // TikTok
    if (window.ttq) window.ttq.track(event === 'PageView' ? 'ViewContent' : 'SubmitForm', data);
    // Snapchat
    if (window.snaptr) window.snaptr('track', event === 'PageView' ? 'PAGE_VIEW' : 'SIGN_UP', data);
  } catch (e) { /* pixel not loaded yet */ }
};

const PERKS = [
  { icon: '🏘️', title: 'Help Your Neighbours',    desc: 'The elderly lady on your street who can\'t get to the chemist. The mum with three kids who can\'t queue at the Post Office. You\'re the one who shows up.' },
  { icon: '💷', title: 'Earn £10–£18 an Hour',    desc: 'Real money, paid weekly into your bank account. No waiting. No apps taking 40%. What you earn is yours.' },
  { icon: '⏰', title: 'Work When You Want',       desc: 'Tuesday morning. Saturday afternoon. Evenings after work. You set your availability — we send you jobs that fit.' },
  { icon: '🚶', title: 'No Car Required',          desc: 'On foot, bike, motorbike or car — all welcome. Most errands in Hull are under 2 miles.' },
];

const STORIES = [
  { name: 'Sarah, HU5', role: 'Buddy since launch', quote: 'I do a few hours on weekday mornings while my kids are at school. It\'s proper flexible and I\'m actually helping people I know.', avatar: '👩' },
  { name: 'Marcus, HU3', role: 'Top Buddy', quote: 'I was between jobs and needed something quick. Got my first order within 2 days. Now I do 4–5 jobs a day and earn more than my old job.', avatar: '👨' },
  { name: 'Priya, HU8', role: 'Weekend Buddy', quote: 'I love that it\'s local. These are real people in Hull who need help — not some faceless delivery app.', avatar: '👩🏽' },
];

const FAQS = [
  ['Do I need a car?', 'No — you can work on foot, bicycle, motorbike, or car. Most Hull errands are under 2 miles. We\'ll show you jobs based on your transport type.'],
  ['When do I get paid?', 'Every Friday, directly into your bank account. No delay, no minimum threshold.'],
  ['How much can I realistically earn?', 'Most Buddies doing 3–4 hours a day earn £150–£250/week. Top Buddies doing full days earn £350–£500/week.'],
  ['Is there a minimum commitment?', 'None. Log on when you want, log off when you want. No shifts, no manager, no penalty for days off.'],
  ['What about taxes?', 'You\'ll be self-employed as an independent contractor. We send you an annual earnings statement. Most Buddies register as sole traders with HMRC — it takes 10 minutes at gov.uk.'],
  ['How do I get started?', 'Fill in the form below. We review within 2–3 days. If approved, short onboarding call, then you\'re live.'],
];

const VEHICLE_OPTIONS = [
  { id: 'foot',       icon: '🚶', label: 'On Foot'    },
  { id: 'bicycle',    icon: '🚲', label: 'Bicycle'    },
  { id: 'motorbike',  icon: '🏍️', label: 'Motorbike'  },
  { id: 'car',        icon: '🚗', label: 'Car'        },
];

export default function JoinPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: '', phone: '', email: '', postcode: '', vehicle: '', availability: '', why: '' });
  const [openFaq, setOpenFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Inject tracking pixels on mount
  useEffect(() => {
    // Meta Pixel
    const metaScript = document.createElement('script');
    metaScript.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${META_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(metaScript);

    // TikTok Pixel
    const ttScript = document.createElement('script');
    ttScript.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=i+"?sdkid="+e+"&lib="+t;
        e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('${TIKTOK_PIXEL_ID}');ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(ttScript);

    // Snapchat Pixel
    const snapScript = document.createElement('script');
    snapScript.innerHTML = `
      (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?
      a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];
      var s='script';r=t.createElement(s);r.async=!0;r.src=n;
      var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);
      })(window,document,'https://sc-static.net/scevent.min.js');
      snaptr('init', '${SNAPCHAT_PIXEL_ID}', {'user_email': ''});
      snaptr('track', 'PAGE_VIEW');
    `;
    document.head.appendChild(snapScript);

    firePixels('PageView');
  }, []);

  const submit = async () => {
    if (!form.name || !form.phone || !form.email || !form.postcode || !form.vehicle) {
      setError('Please fill in all required fields'); return;
    }
    setSubmitting(true); setError('');
    try {
      await addDoc(collection(db, 'applications'), {
        ...form,
        source: 'social_ad',
        utm: window.location.search, // captures ?utm_source=facebook etc
        status: 'pending',
        tier: 'new',
        type: 'express', // short form from ad
        createdAt: serverTimestamp(),
      });
      firePixels('Lead', { content_name: 'Buddy Application', value: 1, currency: 'GBP' });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError('Something went wrong. Please try again or WhatsApp us.');
    } finally { setSubmitting(false); }
  };

  const heroGrad = isDark
    ? 'linear-gradient(160deg, #0D0720 0%, #1A0F2E 50%, #0D1117 100%)'
    : 'linear-gradient(160deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%)';

  const inp = { width: '100%', background: theme.card2, border: `1.5px solid ${theme.border}`, borderRadius: 12, padding: '13px 16px', color: theme.text, fontSize: 15, fontFamily: "'Inter', sans-serif", outline: 'none' };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text, marginBottom: 14 }}>You're In!</h1>
        <p style={{ fontSize: 16, color: theme.muted, lineHeight: 1.8, marginBottom: 28 }}>
          Thanks <strong style={{ color: theme.text }}>{form.name.split(' ')[0]}</strong>! We've got your application. We'll call you on <strong style={{ color: theme.text }}>{form.phone}</strong> within 2–3 days.
        </p>
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: '24px 28px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: theme.text }}>What happens next:</div>
          {[
            ['📞', 'We call you within 2–3 days to have a quick chat'],
            ['🔍', 'We\'ll ask you to complete a DBS check (£18 — takes 10 min at gov.uk)'],
            ['🎓', 'Short 20-min onboarding call — we walk you through the app'],
            ['🚀', 'You go live and start earning — usually within one week'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14, color: theme.text2 }}>
              <span style={{ flexShrink: 0 }}>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: theme.muted }}>Questions? WhatsApp us at <strong style={{ color: theme.primary }}>hello@onlybuddy.co.uk</strong></div>
      </div>
    </div>
  );

  return (
    <div style={{ background: theme.bg, overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .join-inp:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}22; }
        .vehicle-opt:hover { border-color: ${theme.primary} !important; }
        .faq-row:hover { background: ${theme.bg2} !important; }
        .perk-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        @media(max-width:640px) {
          .stories-grid { grid-template-columns: 1fr !important; }
          .perks-grid   { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:400px) {
          .perks-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Minimal top bar — no distracting nav */}
      <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #4338CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤝</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: theme.primary, fontFamily: "'Outfit', sans-serif" }}>OnlyBuddy</span>
          <span style={{ fontSize: 11, color: theme.muted, marginLeft: 4 }}>Hull's Errand App</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.green, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.green, display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Accepting Buddies in Hull
          </div>
          <button onClick={toggleTheme} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: heroGrad, padding: 'clamp(56px, 12vw, 100px) 20px clamp(48px, 10vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Now hiring in all Hull postcodes</span>
          </div>

          <h1 style={{ fontSize: 'clamp(34px, 8vw, 64px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1.1, marginBottom: 18 }}>
            Hull Needs You.<br />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Be a Buddy.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            Your neighbours need help with errands — prescriptions, groceries, queues, parcels. You show up. You earn. Hull looks after Hull.
          </p>

          <a href="#apply-form" style={{ display: 'inline-block', background: '#fff', color: '#4338CA', padding: '16px 40px', borderRadius: 14, fontSize: 17, fontWeight: 800, textDecoration: 'none', fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            Apply in 2 Minutes →
          </a>

          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 44, flexWrap: 'wrap' }}>
            {[['£10–£18/hr', 'Hourly Earnings'], ['Your Hours', 'Full Flexibility'], ['Weekly', 'Bank Transfers'], ['Free', 'To Join']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY BECOME A BUDDY */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Why Join</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text, lineHeight: 1.2 }}>More Than Just a Side Job</h2>
          <p style={{ fontSize: 15, color: theme.muted, marginTop: 10, maxWidth: 480, margin: '10px auto 0', lineHeight: 1.7 }}>You're not just delivering. You're the person your community can count on.</p>
        </div>
        <div className="perks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {PERKS.map(p => (
            <div key={p.title} className="perk-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 24, transition: 'all 0.2s' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STORIES */}
      <div style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Real Buddies</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text }}>What Buddies Say</h2>
          </div>
          <div className="stories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {STORIES.map(s => (
              <div key={s.name} style={{ background: theme.bg2, borderRadius: 18, padding: 24, border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{s.avatar}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: "'Outfit', sans-serif" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: theme.primary, fontWeight: 600, marginBottom: 14 }}>{s.role}</div>
                <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.75, fontStyle: 'italic' }}>"{s.quote}"</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: theme.muted }}>* Names changed for privacy. Stories verified by OnlyBuddy.</div>
        </div>
      </div>

      {/* HOW IT WORKS FOR BUDDIES */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>The Process</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text }}>From Application to First Earning</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { n: '01', icon: '📝', t: 'Apply in 2 Minutes', d: 'Fill in the short form below. Name, phone, postcode. That\'s it to start.' },
            { n: '02', icon: '📞', t: 'We Call You',         d: 'A real person from OnlyBuddy calls within 2–3 days for a quick chat.' },
            { n: '03', icon: '🔍', t: 'Quick Verification',  d: 'Basic DBS check (£18, you arrange at gov.uk) and ID photo. Keeps everyone safe.' },
            { n: '04', icon: '💷', t: 'Start Earning',       d: 'Go live on the app. Accept your first job. Get paid Friday.' },
          ].map(s => (
            <div key={s.n} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: isDark ? theme.primaryBg : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 800, color: theme.primary, letterSpacing: 1.5 }}>STEP {s.n}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text }}>Common Questions</h2>
          </div>
          {FAQS.map(([q, a], i) => (
            <div key={q} className="faq-row" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderBottom: `1px solid ${theme.border}`, padding: '16px 12px', cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{q}</div>
                <div style={{ fontSize: 18, color: theme.muted, flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</div>
              </div>
              {openFaq === i && <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.75, marginTop: 10, paddingRight: 24 }}>{a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── APPLICATION FORM ── */}
      <div id="apply-form" style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Get Started</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: theme.text, marginBottom: 10 }}>Apply in 2 Minutes</h2>
          <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.7 }}>No CV. No lengthy form. Just the basics — we'll do the rest on a call.</p>
        </div>

        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 'clamp(24px, 5vw, 40px)', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Full Name *</label>
              <input className="join-inp" style={inp} placeholder="e.g. James Smith" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Postcode *</label>
              <input className="join-inp" style={inp} placeholder="e.g. HU5 2RQ" value={form.postcode} onChange={e => set('postcode', e.target.value.toUpperCase())} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Phone Number *</label>
            <input className="join-inp" style={inp} type="tel" placeholder="07712 345678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Email Address *</label>
            <input className="join-inp" style={inp} type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>How Do You Get Around? *</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {VEHICLE_OPTIONS.map(v => (
                <button key={v.id} className="vehicle-opt" onClick={() => set('vehicle', v.id)} style={{ flex: 1, minWidth: 80, padding: '12px 10px', borderRadius: 12, border: `1.5px solid ${form.vehicle === v.id ? theme.primary : theme.border}`, background: form.vehicle === v.id ? theme.primaryBg : theme.card2, color: form.vehicle === v.id ? theme.primary : theme.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{v.icon}</div>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>When Are You Available?</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Weekday mornings', 'Weekday afternoons', 'Evenings', 'Weekends', 'Flexible / anytime'].map(a => (
                <button key={a} onClick={() => set('availability', a)} style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${form.availability === a ? theme.primary : theme.border}`, background: form.availability === a ? theme.primaryBg : theme.card2, color: form.availability === a ? theme.primary : theme.muted, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Why Do You Want to Be a Buddy? (optional)</label>
            <textarea className="join-inp" style={{ ...inp, resize: 'vertical', minHeight: 80 }} rows={3} placeholder="Tell us a bit about yourself — no pressure, just a few words..." value={form.why} onChange={e => set('why', e.target.value)} />
          </div>

          {error && <div style={{ background: theme.redBg, border: `1px solid ${theme.red}33`, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: theme.red, fontWeight: 600 }}>⚠️ {error}</div>}

          <button onClick={submit} disabled={submitting} style={{ width: '100%', padding: 17, borderRadius: 14, border: 'none', background: submitting ? theme.muted : 'linear-gradient(135deg, #6366F1, #4338CA)', color: '#fff', fontSize: 17, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", boxShadow: submitting ? 'none' : '0 6px 24px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}>
            {submitting ? '⏳ Submitting...' : '🤝 Apply to Be a Buddy →'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: theme.muted, lineHeight: 1.6 }}>
            By applying you agree to our <a href="/terms" style={{ color: theme.primary, fontWeight: 600 }}>Terms of Service</a> and <a href="/privacy" style={{ color: theme.primary, fontWeight: 600 }}>Privacy Policy</a>.<br />
            We will never share your details with third parties.
          </div>
        </div>
      </div>

      {/* Footer — minimal */}
      <div style={{ borderTop: `1px solid ${theme.border}`, padding: '24px 20px', textAlign: 'center', fontSize: 12, color: theme.muted }}>
        © {new Date().getFullYear()} OnlyBuddy Ltd · Registered in England & Wales · <a href="/privacy" style={{ color: theme.primary }}>Privacy Policy</a> · <a href="/terms" style={{ color: theme.primary }}>Terms</a>
      </div>
    </div>
  );
}

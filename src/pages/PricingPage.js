import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SERVICES = [
  { icon: '🛒', name: 'Grocery Run',      base: 5.00, perMile: 1.00, note: 'You pay the shop directly — we just collect and deliver' },
  { icon: '🛍️', name: 'Buy & Deliver',     base: 6.00, perMile: 1.00, note: 'Buddy buys with their own money — you repay + service fee' },
  { icon: '⏳', name: 'Queue for Me',      base: 10.00, per: 'per hour', note: 'Minimum 30 minutes charged' },
  { icon: '📦', name: 'Parcel & Returns',  base: 5.00, perMile: 0.75, note: 'Drop-off and collections from any carrier' },
  { icon: '💊', name: 'Prescription Run',  base: 5.00, flat: true,   note: 'Flat rate regardless of distance within Hull' },
];

const FAQ = [
  ['How is the distance fee calculated?', 'We calculate the distance from your address to the shop or collection point. The first mile is included in the base fee. Every additional mile is charged at the rate shown above.'],
  ['Do I pay before or after the errand?', 'You pay after the errand is completed. Your card or PayPal is only charged once your Buddy confirms delivery.'],
  ['What if my Buddy can\'t complete the errand?', 'If your Buddy is unable to complete the task for any reason, you will not be charged. We\'ll reassign to another Buddy or issue a full refund.'],
  ['Are there any hidden fees?', 'No. The base fee plus distance is all you pay. We never add unexpected charges. If a Buddy needs to buy items, you repay the exact shop receipt amount.'],
  ['Can I tip my Buddy?', 'Yes! After your order is completed you can add a tip through the app. 100% of tips go directly to your Buddy.'],
  ['Do you cover all of Hull?', 'Yes — we cover all Hull postcodes from HU1 to HU17. If you\'re unsure, just enter your postcode when booking and we\'ll confirm coverage.'],
];

export default function PricingPage() {
  const { theme } = useTheme();
  return (
    <div style={{ background: theme.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Simple & Transparent</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>Honest Pricing</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto' }}>No subscriptions. No hidden fees. Pay only when your errand is done.</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 60 }}>
          {SERVICES.map(s => (
            <div key={s.name} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif" }}>
                £{s.base.toFixed(2)}
                <span style={{ fontSize: 14, color: theme.muted, fontWeight: 500 }}> base</span>
              </div>
              {s.perMile && <div style={{ fontSize: 13, color: theme.text2, marginTop: 4 }}>+ £{s.perMile.toFixed(2)}/mile after 1st mile</div>}
              {s.per && <div style={{ fontSize: 13, color: theme.text2, marginTop: 4 }}>{s.per}</div>}
              {s.flat && <div style={{ fontSize: 13, color: theme.green, fontWeight: 600, marginTop: 4 }}>✓ Flat rate — any distance in Hull</div>}
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 12, lineHeight: 1.6 }}>{s.note}</div>
            </div>
          ))}
        </div>

        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: '40px 36px', marginBottom: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 24, textAlign: 'center' }}>Example Orders</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { label: 'Pharmacy run (0.8 miles)', breakdown: ['Base fee: £5.00', 'Distance (under 1mi): £0.00'], total: 5.00 },
              { label: 'Tesco shop (1.5 miles)', breakdown: ['Base fee: £5.00', 'Extra 0.5 miles: £0.50'], total: 5.50 },
              { label: 'Post Office queue (45 min)', breakdown: ['Queue fee: £10.00/hr', '45 minutes: £7.50'], total: 7.50 },
              { label: 'Argos pickup (2.2 miles)', breakdown: ['Base fee: £6.00', 'Extra 1.2 miles: £1.20'], total: 7.20 },
            ].map(ex => (
              <div key={ex.label} style={{ background: theme.bg2, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{ex.label}</div>
                {ex.breakdown.map(b => <div key={b} style={{ fontSize: 13, color: theme.muted, marginBottom: 4 }}>{b}</div>)}
                <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: theme.primary }}>£{ex.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 24, textAlign: 'center' }}>Frequently Asked Questions</h2>
          {FAQ.map(([q, a]) => (
            <div key={q} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{q}</div>
              <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7 }}>{a}</div>
            </div>
          ))}
        </div>

        <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, borderRadius: 24, padding: '48px 36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>Ready to Book Your First Errand?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 28 }}>Get it done in 30 minutes. Pay only when delivered.</p>
          <Link to="/book" style={{ textDecoration: 'none', background: '#fff', color: theme.primary, padding: '16px 40px', borderRadius: 14, fontSize: 16, fontWeight: 800, display: 'inline-block', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Book a Buddy →
          </Link>
        </div>
      </div>
    </div>
  );
}

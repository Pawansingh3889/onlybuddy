import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  return (
    <footer style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>

        {/* Brand */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary, fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>OnlyBuddy 🤝</div>
          <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7, marginBottom: 16 }}>Hull's errand & grocery delivery app. Trusted local Buddies, fast service, all Hull postcodes covered.</div>
          <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.9 }}>
            📍 Hull, East Yorkshire<br />
            📧 hello@onlybuddy.co.uk<br />
            {/* ⚠️ REPLACE WITH YOUR REAL NUMBER BEFORE GOING LIVE */}
            📞 <span style={{ color: theme.text2 }}>01482 000 000</span>
          </div>
        </div>

        {/* Services */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Services</div>
          {[
            ['🛒', 'Grocery Run',      '/book'],
            ['🛍️', 'Buy & Deliver',    '/book'],
            ['⏳', 'Queue for Me',      '/book'],
            ['📦', 'Parcel & Returns', '/book'],
            ['💊', 'Prescription Run', '/book'],
          ].map(([icon, label, to]) => (
            <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: theme.text2, marginBottom: 8, textDecoration: 'none' }}>
              <span style={{ fontSize: 14 }}>{icon}</span>{label}
            </Link>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Company</div>
          {[
            ['/', 'Home'],
            ['/about', 'How It Works'],
            ['/pricing', 'Pricing'],
            ['/apply', 'Become a Buddy'],
            ['/join', 'Buddy Recruitment'],
            ['/book', 'Book a Buddy'],
          ].map(([to, label]) => (
            <Link key={to} to={to} style={{ display: 'block', fontSize: 13, color: theme.text2, marginBottom: 8, textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>

        {/* Trust */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Trust & Safety</div>
          {['DBS Checked Buddies', 'ID Verified', 'Pay After Delivery', 'Live Order Tracking', 'Rated by Customers'].map(s => (
            <div key={s} style={{ fontSize: 13, color: theme.text2, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: theme.green || '#059669' }}>✓</span>{s}
            </div>
          ))}
        </div>

        {/* Legal */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Legal</div>
          <Link to="/terms"   style={{ display: 'block', fontSize: 13, color: theme.text2, marginBottom: 8, textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ display: 'block', fontSize: 13, color: theme.text2, marginBottom: 8, textDecoration: 'none' }}>Privacy Policy</Link>
          <div style={{ fontSize: 13, color: theme.text2, marginBottom: 8 }}>Cookie Policy</div>
          <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.7, marginTop: 12 }}>
            {/* ⚠️ FILL IN BEFORE GO-LIVE */}
            ICO Reg: <span style={{ color: theme.text2 }}>ZB000000</span><br />
            Co. No: <span style={{ color: theme.text2 }}>00000000</span>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12, color: theme.muted }}>© {new Date().getFullYear()} OnlyBuddy Ltd · Registered in England & Wales</div>
        <div style={{ fontSize: 12, color: theme.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/privacy" style={{ color: theme.muted, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms"   style={{ color: theme.muted, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

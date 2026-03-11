import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  return (
    <footer style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>OnlyBuddy 🤝</div>
          <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.6, marginBottom: 16 }}>Hull's errand & grocery delivery app. Trusted Buddies, fast service, all of Hull covered.</div>
          <div style={{ fontSize: 12, color: theme.muted }}>📍 Hull, East Yorkshire<br />📧 hello@onlybuddy.co.uk</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Services</div>
          {['Grocery Run', 'Buy & Deliver', 'Queue for Me', 'Parcel & Returns', 'Prescription Run'].map(s => (
            <div key={s} style={{ fontSize: 13, color: theme.text2, marginBottom: 8 }}>{s}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Company</div>
          {[['/', 'Home'], ['/about', 'How It Works'], ['/pricing', 'Pricing'], ['/apply', 'Become a Buddy']].map(([to, label]) => (
            <Link key={to} to={to} style={{ display: 'block', fontSize: 13, color: theme.text2, marginBottom: 8, textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Trust & Safety</div>
          {['DBS Checked Buddies', 'ID Verified', 'Fully Insured', 'Live Order Tracking', '24/7 Support'].map(s => (
            <div key={s} style={{ fontSize: 13, color: theme.text2, marginBottom: 8 }}>✓ {s}</div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12, color: theme.muted }}>© {new Date().getFullYear()} OnlyBuddy Ltd · Registered in England & Wales</div>
        <div style={{ fontSize: 12, color: theme.muted, display: 'flex', gap: 16 }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
}

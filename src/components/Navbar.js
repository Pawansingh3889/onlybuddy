import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentUser, userRole, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();

  const isActive = (path) => loc.pathname === path;

  const navLinks = [
    { to: '/',        label: 'Home'       },
    { to: '/about',   label: 'How It Works' },
    { to: '/pricing', label: 'Pricing'    },
    { to: '/apply',   label: 'Become a Buddy', highlight: true },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: theme.navBg, borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤝</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>OnlyBuddy</div>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 0.5, lineHeight: 1 }}>HULL'S ERRAND APP</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} style={{
                textDecoration: 'none',
                padding: '8px 16px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                background: l.highlight
                  ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                  : isActive(l.to) ? theme.primaryBg : 'transparent',
                color: l.highlight ? '#fff' : isActive(l.to) ? theme.primary : theme.text2,
                border: l.highlight ? 'none' : '1px solid transparent',
                transition: 'all 0.18s',
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDark ? '☀️' : '🌙'}
            </button>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to={userRole === 'admin' ? '/admin' : userRole === 'buddy' ? '/buddy' : '/book'} style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: theme.primaryBg, color: theme.primary, border: `1px solid ${theme.primary}33` }}>
                  Dashboard
                </Link>
                <button onClick={logout} style={{ background: theme.redBg, border: `1px solid ${theme.red}33`, color: theme.red, borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}>
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(o => !o)} className="mobile-menu-btn" style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'none', alignItems: 'center', justifyContent: 'center' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }} className="mobile-menu">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: l.highlight ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` : isActive(l.to) ? theme.primaryBg : theme.bg2, color: l.highlight ? '#fff' : isActive(l.to) ? theme.primary : theme.text }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

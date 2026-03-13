import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentUser, userRole, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();
  const isActive = (path) => loc.pathname === path;

  useEffect(() => { setMenuOpen(false); }, [loc.pathname]);

  const navLinks = [
    { to: '/',        label: 'Home'           },
    { to: '/about',   label: 'How It Works'   },
    { to: '/pricing', label: 'Pricing'        },
    { to: '/apply',   label: 'Become a Buddy', highlight: true },
  ];

  return (
    <>
      <style>{`
        .ob-nav-desktop { display: flex; }
        .ob-hamburger   { display: none !important; }
        @media (max-width: 768px) {
          .ob-nav-desktop { display: none !important; }
          .ob-hamburger   { display: flex !important; }
        }
        .ob-navlink:hover { opacity: 0.8; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: theme.navBg,
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        width: '100%',
        maxWidth: '100vw',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, gap: 12 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.btnGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤝</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: theme.primary, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>OnlyBuddy</div>
              <div style={{ fontSize: 8, color: theme.muted, letterSpacing: 0.8, lineHeight: 1, textTransform: 'uppercase' }}>Hull's Errand App</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="ob-nav-desktop" style={{ alignItems: 'center', gap: 2 }}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="ob-navlink" style={{
                textDecoration: 'none', padding: '7px 14px', borderRadius: 9,
                fontSize: 13, fontWeight: 600,
                background: l.highlight
                  ? theme.btnGradient
                  : isActive(l.to) ? theme.primaryBg : 'transparent',
                color: l.highlight ? '#fff' : isActive(l.to) ? theme.primary : theme.text2,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Dark mode toggle */}
            <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'} style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 9, width: 34, height: 34, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Auth buttons — desktop */}
            {currentUser ? (
              <div className="ob-nav-desktop" style={{ alignItems: 'center', gap: 6 }}>
                <Link to={userRole === 'admin' ? '/admin' : userRole === 'buddy' ? '/buddy' : '/book'} style={{ textDecoration: 'none', padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: theme.primaryBg, color: theme.primary, border: `1px solid ${theme.primary}33` }}>
                  {userRole === 'admin' ? '⚙️ Admin' : userRole === 'buddy' ? '🚴 Dashboard' : 'My Orders'}
                </Link>
                <button onClick={logout} style={{ background: theme.redBg, border: `1px solid ${theme.red}33`, color: theme.red, borderRadius: 9, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="ob-nav-desktop" style={{ textDecoration: 'none', padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: theme.card2, color: theme.text, border: `1px solid ${theme.border}` }}>
                Sign In
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button className="ob-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 9, width: 34, height: 34, cursor: 'pointer', fontSize: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', padding: '13px 16px', borderRadius: 11, fontSize: 15, fontWeight: 600, background: l.highlight ? theme.btnGradient : isActive(l.to) ? theme.primaryBg : theme.bg2, color: l.highlight ? '#fff' : isActive(l.to) ? theme.primary : theme.text, display: 'block' }}>
                {l.label}
              </Link>
            ))}
            <div style={{ height: 1, background: theme.border, margin: '8px 0' }} />
            {currentUser ? (
              <>
                <Link to={userRole === 'admin' ? '/admin' : userRole === 'buddy' ? '/buddy' : '/book'} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', padding: '13px 16px', borderRadius: 11, fontSize: 15, fontWeight: 600, background: theme.primaryBg, color: theme.primary, display: 'block' }}>
                  {userRole === 'admin' ? '⚙️ Admin Panel' : userRole === 'buddy' ? '🚴 Buddy Dashboard' : '📋 My Orders'}
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{ padding: '13px 16px', borderRadius: 11, border: `1px solid ${theme.red}44`, background: theme.redBg, color: theme.red, fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', padding: '13px 16px', borderRadius: 11, fontSize: 15, fontWeight: 700, background: theme.btnGradient, color: '#fff', display: 'block', textAlign: 'center' }}>
                Sign In / Create Account
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

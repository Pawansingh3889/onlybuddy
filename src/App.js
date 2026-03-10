import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Login from './Login';
import CustomerApp from './pages/CustomerApp';
import RunnerApp from './pages/RunnerApp';
import AdminDashboard from './pages/AdminDashboard';
import { MOCK_RUNNERS } from './data';
import { ToastProvider } from './components/Toast';


function AppShell() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { currentUser, userRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('customer');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [isDark, T]);

  if (!currentUser) return <Login />;

  const allTabs = [
    { id: 'customer', icon: '🛒', label: 'Customer View', desc: 'Book errands & groceries' },
    { id: 'runner',   icon: '🏃', label: 'Buddy View',    desc: 'Accept & complete jobs'   },
    { id: 'admin',    icon: '📊', label: 'Admin View',    desc: 'Manage operations'         },
  ];

  const visibleTabs =
    userRole === 'admin'  ? allTabs :
    userRole === 'buddy'  ? allTabs.filter(t => t.id === 'runner') :
                            allTabs.filter(t => t.id === 'customer');

  const safeTab = visibleTabs.find(t => t.id === activeTab)
    ? activeTab : visibleTabs[0]?.id;

  const onlineBuddies = MOCK_RUNNERS.filter(r => r.online).length;

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div className="ob-app-layout">

        {/* SIDEBAR */}
        <aside className="ob-sidebar" style={{ background: T.card, borderRight: `1px solid ${T.border}` }}>
          <div style={{ padding: '28px 22px 20px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize: 22, fontWeight: 900,
              background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OnlyBuddy 🤝
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Hull's Errand &amp; Grocery App</div>
          </div>

          <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              background: T.primaryBg, borderRadius: 12, marginBottom: 10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%',
                background:`linear-gradient(135deg,${T.primary},${T.primaryLight})`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                {userRole==='admin'?'👑':userRole==='buddy'?'🏃':'👤'}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{currentUser.email?.split('@')[0]}</div>
                <div style={{ fontSize:10, color:T.primary, fontWeight:600, textTransform:'capitalize' }}>{userRole||'customer'}</div>
              </div>
            </div>

            {visibleTabs.map(t => (
              <button key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  width:'100%', padding:'11px 14px', borderRadius:12,
                  border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left',
                  background: safeTab===t.id ? T.primaryBg : 'transparent',
                  color:      safeTab===t.id ? T.primary   : T.muted,
                  boxShadow:  safeTab===t.id ? `inset 2px 0 0 ${T.primary}` : 'none',
                  transition:'all 0.18s',
                }}>
                <span style={{ fontSize:22 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{t.label}</div>
                  <div style={{ fontSize:11, opacity:0.7, marginTop:1 }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ padding:'16px 12px', borderTop:`1px solid ${T.border}`, display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={toggleTheme}
              style={{ width:'100%', padding:'10px 14px', borderRadius:10,
                border:`1px solid ${T.border}`, background:T.bg2,
                color:T.text2, fontSize:13, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', gap:8,
                fontFamily:"'DM Sans',sans-serif", justifyContent:'center' }}>
              {isDark?'☀️ Light Mode':'🌙 Dark Mode'}
            </button>
            <button onClick={logout}
              style={{ width:'100%', padding:'10px 14px', borderRadius:10,
                border:`1px solid ${T.red}44`, background:T.redBg,
                color:T.red, fontSize:13, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', gap:8,
                fontFamily:"'DM Sans',sans-serif", justifyContent:'center' }}>
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ob-main">
          {/* Desktop topbar */}
          <div className="ob-desktop-topbar"
            style={{ background:T.card, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:T.green, display:'inline-block' }} />
              <span style={{ fontSize:14, color:T.text2, fontWeight:600 }}>
                {visibleTabs.find(t=>t.id===safeTab)?.label}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:12, color:T.muted }}>Hull, United Kingdom</span>
              <div style={{ background:T.greenBg, color:T.green,
                border:`1px solid ${T.green}33`, borderRadius:20,
                fontSize:11, fontWeight:700, padding:'4px 12px' }}>
                ● {onlineBuddies} Buddies Online
              </div>
              <button onClick={logout}
                style={{ background:T.redBg, border:`1px solid ${T.red}44`,
                  color:T.red, borderRadius:10, padding:'6px 12px',
                  fontSize:12, fontWeight:700, cursor:'pointer',
                  fontFamily:"'DM Sans',sans-serif" }}>
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile topbar */}
          <div className="ob-mobile-topbar"
            style={{ background:T.card, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:900,
              background:`linear-gradient(135deg,${T.primary},${T.primaryLight})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              OnlyBuddy 🤝
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={toggleTheme}
                style={{ background:T.bg2, border:`1px solid ${T.border}`,
                  borderRadius:10, width:36, height:36, cursor:'pointer', fontSize:16,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                {isDark?'☀️':'🌙'}
              </button>
              <button onClick={logout}
                style={{ background:T.redBg, border:`1px solid ${T.red}44`,
                  borderRadius:10, width:36, height:36, cursor:'pointer',
                  color:T.red, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                🚪
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="ob-app-frame">
            <div className="ob-app-frame-inner">
              {safeTab === 'customer' && <CustomerApp key="customer" />}
              {safeTab === 'runner'   && <RunnerApp   key="runner"   />}
              {safeTab === 'admin'    && <AdminDashboard key="admin" />}
            </div>
          </div>
          <div className="ob-mobile-spacer" />
        </main>

        {/* Mobile bottom nav */}
        <nav className="ob-mobile-bottomnav"
          style={{ background:T.navBg, borderTop:`1px solid ${T.border}` }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flex:1, padding:'10px 4px 12px', background:'none', border:'none',
                color: safeTab===t.id ? T.primary : T.muted,
                display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                borderTop: safeTab===t.id ? `2px solid ${T.primary}` : '2px solid transparent' }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:10, fontWeight: safeTab===t.id ? 700 : 500 }}>
                {t.label.replace(' View','')}
              </span>
            </button>
          ))}
        </nav>
      </div>
      <ToastProvider />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

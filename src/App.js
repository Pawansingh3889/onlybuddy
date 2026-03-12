import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar         from './components/Navbar';
import Footer         from './components/Footer';
import ErrorBoundary  from './components/ErrorBoundary';

const HomePage       = lazy(() => import('./pages/HomePage'));
const AboutPage      = lazy(() => import('./pages/AboutPage'));
const PricingPage    = lazy(() => import('./pages/PricingPage'));
const BookingPage    = lazy(() => import('./pages/BookingPage'));
const BuddyApply     = lazy(() => import('./pages/BuddyApply'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const JoinPage       = lazy(() => import('./pages/JoinPage'));
const TermsPage      = lazy(() => import('./pages/TermsPage'));
const PrivacyPage    = lazy(() => import('./pages/PrivacyPage'));
const Login          = lazy(() => import('./Login'));

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { overflow-x: hidden; max-width: 100%; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: background 0.25s, color 0.25s;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-size: 15px;
      line-height: 1.6;
    }
    h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; line-height: 1.25; }
    input, textarea, button, select { font-family: 'Inter', sans-serif; }
    a { color: inherit; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  `}</style>
);

const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 15 }}>
    Loading…
  </div>
);

function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!currentUser || userRole !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function NotFoundPage() {
  const { theme } = useTheme();
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🤷</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: theme.primary, fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>404</h1>
        <p style={{ fontSize: 18, color: theme.muted, marginBottom: 32 }}>Page not found — it might have moved or never existed.</p>
        <Link to="/" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 12, background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main pages */}
        <Route path="/"        element={<PublicLayout><HomePage    /></PublicLayout>} />
        <Route path="/about"   element={<PublicLayout><AboutPage   /></PublicLayout>} />
        <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
        <Route path="/apply"   element={<PublicLayout><BuddyApply  /></PublicLayout>} />
        <Route path="/book"    element={<PrivateRoute><PublicLayout><BookingPage /></PublicLayout></PrivateRoute>} />
        <Route path="/login"   element={<PublicLayout><Login       /></PublicLayout>} />

        {/* Legal */}
        <Route path="/terms"   element={<PublicLayout><TermsPage   /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />

        {/* Ad landing page — NO Navbar/Footer (distraction-free) */}
        <Route path="/join"    element={<JoinPage />} />

        {/* Admin — protected */}
        <Route path="/admin"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="*"        element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyles />
        <ErrorBoundary>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar         from './components/Navbar';
import Footer         from './components/Footer';
import HomePage       from './pages/HomePage';
import AboutPage      from './pages/AboutPage';
import PricingPage    from './pages/PricingPage';
import BookingPage    from './pages/BookingPage';
import BuddyApply     from './pages/BuddyApply';
import AdminDashboard from './pages/AdminDashboard';
import Login          from './Login';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; transition: background 0.2s, color 0.2s; }
    input, textarea, button, select { font-family: inherit; }
    a { color: inherit; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  `}</style>
);

function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#64748B', fontSize: 16 }}>Loading…</div>;
  if (!currentUser || userRole !== 'admin') return <Navigate to="/login" replace />;
  return children;
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
    <Routes>
      <Route path="/"        element={<PublicLayout><HomePage    /></PublicLayout>} />
      <Route path="/about"   element={<PublicLayout><AboutPage   /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
      <Route path="/apply"   element={<PublicLayout><BuddyApply  /></PublicLayout>} />
      <Route path="/book"    element={<PublicLayout><BookingPage /></PublicLayout>} />
      <Route path="/login"   element={<PublicLayout><Login       /></PublicLayout>} />
      <Route path="/admin"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyles />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

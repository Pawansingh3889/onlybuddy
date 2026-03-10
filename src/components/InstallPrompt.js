import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { subscribeToPush, isInstalledPWA } from '../pwa';
import { showToast } from './Toast';

export function InstallPrompt() {
  const { theme: T } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall]       = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const [dismissed, setDismissed]           = useState(
    () => localStorage.getItem('ob-install-dismissed') === 'true'
  );

  useEffect(() => {
    // PWA install prompt
    const handler = e => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed && !isInstalledPWA()) setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show notification prompt after 30s if not yet granted
    const t = setTimeout(() => {
      if (Notification.permission === 'default' && !dismissed) {
        setShowNotifBanner(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(t);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('OnlyBuddy installed! 🎉', 'success');
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleEnableNotifs = async () => {
    const result = await subscribeToPush();
    if (result.success) {
      showToast('Notifications enabled! 🔔', 'success');
    } else if (result.reason === 'permission_denied') {
      showToast('Notifications blocked in browser settings', 'error');
    }
    setShowNotifBanner(false);
  };

  const dismiss = () => {
    setShowInstall(false);
    setShowNotifBanner(false);
    setDismissed(true);
    localStorage.setItem('ob-install-dismissed', 'true');
  };

  const bannerStyle = {
    position: 'fixed', bottom: 80, left: 12, right: 12,
    zIndex: 8000, borderRadius: 20,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    animation: 'fadeUp 0.4s ease both',
    maxWidth: 460, margin: '0 auto',
  };

  // ── Install banner ──
  if (showInstall) return (
    <div style={bannerStyle}>
      <div style={{
        background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`,
        borderRadius: 20, padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 42 }}>🤝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: "'Syne',sans-serif" }}>
              Install OnlyBuddy
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
              Add to your home screen for quick access
            </div>
          </div>
          <button onClick={dismiss} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['⚡ Works offline', ''], ['🔔 Job alerts', ''], ['📱 App feel', '']].map(([t]) => (
            <div key={t} style={{
              flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '7px 8px', textAlign: 'center', fontSize: 10,
              fontWeight: 700, color: '#fff',
            }}>{t}</div>
          ))}
        </div>
        <button onClick={handleInstall} style={{
          width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 14,
          background: '#fff', color: T.primary, border: 'none',
          fontWeight: 800, fontSize: 14, cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif",
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          Install App →
        </button>
      </div>
    </div>
  );

  // ── Notification banner ──
  if (showNotifBanner) return (
    <div style={bannerStyle}>
      <div style={{
        background: T.card, border: `1.5px solid ${T.border}`,
        borderRadius: 20, padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: T.primaryBg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26,
          }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: "'Syne',sans-serif" }}>
              Get job alerts
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
              Buddies: get notified instantly when a new job arrives near you
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleEnableNotifs} style={{
            flex: 1, padding: '11px 0', borderRadius: 12,
            background: T.primary, color: '#fff', border: 'none',
            fontWeight: 800, fontSize: 13, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
          }}>Enable Notifications</button>
          <button onClick={dismiss} style={{
            padding: '11px 18px', borderRadius: 12,
            background: T.bg2, border: `1px solid ${T.border}`,
            color: T.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
          }}>Not now</button>
        </div>
      </div>
    </div>
  );

  return null;
}

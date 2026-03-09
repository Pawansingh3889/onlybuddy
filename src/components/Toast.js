import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

let toastFn = null;

export function showToast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

export function ToastProvider() {
  const { theme: T } = useTheme();
  const [toast, setToast] = useState(null);

  const show = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    toastFn = show;
    return () => { toastFn = null; };
  }, [show]);

  if (!toast) return null;

  const colors = {
    success: { bg: T.green,   icon: '✅' },
    error:   { bg: T.red,     icon: '❌' },
    info:    { bg: T.primary, icon: 'ℹ️' },
    email:   { bg: '#0EA5E9', icon: '📧' },
  };
  const c = colors[toast.type] || colors.success;

  return (
    <div className="ob-toast" style={{ background: c.bg, color: '#fff' }}>
      <span>{c.icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

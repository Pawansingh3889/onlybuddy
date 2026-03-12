// ── PWA Registration + Push Notifications ──────────────────

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (e) {
    console.warn('SW registration failed:', e);
    return null;
  }
}

// Request permission and subscribe to push notifications
export async function subscribeToPush(onSuccess) {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, reason: 'permission_denied' };
    }

    const reg = await navigator.serviceWorker.ready;

    // For real push you'd use your VAPID public key here
    // const VAPID_PUBLIC = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    // const sub = await reg.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
    // });

    // For now — in-app notifications via Firebase work without VAPID
    if (onSuccess) onSuccess();
    return { success: true };
  } catch (e) {
    console.warn('Push subscription failed:', e);
    return { success: false, error: e };
  }
}

// Show a local notification immediately (no server needed)
export function showLocalNotification(title, body, url = '/') {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url },
      tag: 'onlybuddy-job',
    });
  });
}

// Check if app is running as installed PWA
export function isInstalledPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

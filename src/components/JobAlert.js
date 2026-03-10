import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Plays a notification sound using Web Audio API — no file needed
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const times = [0, 0.15, 0.3];
    const freqs  = [520, 660, 800];
    times.forEach((t, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freqs[i];
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.25);
    });
  } catch (e) { /* silently fail if audio blocked */ }
}

export function useJobAlert(jobs, isOnline) {
  const prevJobIds = useRef(new Set());
  const [newJob, setNewJob] = useState(null);

  useEffect(() => {
    if (!isOnline || jobs.length === 0) return;

    const currentIds = new Set(jobs.map(j => j.id));

    // Find truly new jobs (not in previous set)
    const newJobs = jobs.filter(j => !prevJobIds.current.has(j.id));

    if (prevJobIds.current.size > 0 && newJobs.length > 0) {
      // New job arrived!
      playAlertSound();
      setNewJob(newJobs[0]);
      setTimeout(() => setNewJob(null), 6000);
    }

    prevJobIds.current = currentIds;
  }, [jobs, isOnline]);

  return { newJob, clearAlert: () => setNewJob(null) };
}

export function JobAlertBanner({ job, onAccept, onDismiss, errandTypes }) {
  const { theme: T } = useTheme();
  if (!job) return null;

  const et = errandTypes?.find(e => e.id === job.type);

  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 420,
      animation: 'bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${T.green}, #047857)`,
        borderRadius: 20, padding: '16px 18px',
        boxShadow: `0 12px 40px rgba(5,150,105,0.45), 0 0 0 1px rgba(255,255,255,0.1)`,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#fff', animation: 'pulse 1s infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 1, opacity: 0.9 }}>
            NEW JOB ALERT
          </span>
          <button onClick={onDismiss} style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.2)',
            border: 'none', color: '#fff', width: 26, height: 26,
            borderRadius: 8, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Job info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>{et?.icon || '📦'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: "'Syne',sans-serif" }}>
              {job.title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
              📍 {job.address}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: "'Syne',sans-serif" }}>
              £{typeof job.pay === 'number' ? job.pay.toFixed(2) : job.pay}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>fee</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onAccept} style={{
            flex: 1, padding: '11px 0', borderRadius: 12,
            background: '#fff', color: T.green,
            border: 'none', fontWeight: 800, fontSize: 14,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s',
          }}>⚡ Accept Now</button>
          <button onClick={onDismiss} style={{
            padding: '11px 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#fff', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}>Skip</button>
        </div>

        {/* Auto-dismiss progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#fff', borderRadius: 3,
            animation: 'shrink 6s linear forwards',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0%   { opacity:0; transform:translateX(-50%) translateY(-20px) scale(0.9); }
          60%  { transform:translateX(-50%) translateY(4px) scale(1.02); }
          100% { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.4; transform:scale(1.6); }
        }
      `}</style>
    </div>
  );
}

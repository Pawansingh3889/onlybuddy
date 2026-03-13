import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection, onSnapshot, doc, updateDoc, getDoc,
  query, where, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  pending:     { label: 'Available',    color: '#059669', bg: '#D1FAE5', dot: '#059669' },
  accepted:    { label: 'Accepted',     color: '#2563EB', bg: '#DBEAFE', dot: '#2563EB' },
  in_progress: { label: 'In Progress',  color: '#D97706', bg: '#FEF3C7', dot: '#D97706' },
  completed:   { label: 'Completed',    color: '#6B7280', bg: '#F3F4F6', dot: '#6B7280' },
};

const ERRAND_ICONS = {
  'Grocery Run': '🛒', 'Buy & Deliver': '🛍️', 'Queue for Me': '⏳',
  'Parcel & Returns': '📦', 'Prescription Run': '💊',
};

const TIER_CONFIG = {
  new:     { label: '🌱 New Buddy',    color: '#D97706' },
  trusted: { label: '⭐ Trusted',      color: '#2563EB' },
  top:     { label: '🏆 Top Buddy',    color: '#059669' },
};

function timeAgo(ts) {
  if (!ts?.toDate) return 'Just now';
  const diff = (Date.now() - ts.toDate()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function fmtCurrency(n) {
  return '£' + (n || 0).toFixed(2);
}

export default function BuddyDashboard() {
  const { theme, isDark } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('jobs');
  const [buddyProfile, setBuddyProfile] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success');
  const [expandedJob, setExpandedJob] = useState(null);
  const [busyJobId, setBusyJobId] = useState(null);
  const [online, setOnline] = useState(true);
  const [savingOnline, setSavingOnline] = useState(false);

  const flash = useCallback((msg, type = 'success') => {
    setActionMsg(msg); setActionType(type);
    setTimeout(() => setActionMsg(''), 3500);
  }, []);

  // ── Load buddy profile ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), snap => {
      if (snap.exists()) setBuddyProfile({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [currentUser]);

  // ── Live: available jobs (pending, not assigned) ───────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'pending')
    );
    return onSnapshot(q, snap => {
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by createdAt in JS to avoid needing a Firestore composite index
      jobs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAvailableJobs(jobs);
    }, (err) => { console.error('Jobs query error:', err.message); });
  }, []);

  // ── Live: MY active jobs (accepted or in_progress) ─────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('buddyId', '==', currentUser.uid),
      where('status', 'in', ['accepted', 'in_progress'])
    );
    return onSnapshot(q, snap => {
      setMyJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => { console.error('Active jobs error:', err.message); });
  }, [currentUser]);

  // ── Live: completed jobs (this buddy) ──────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('buddyId', '==', currentUser.uid),
      where('status', '==', 'completed')
    );
    return onSnapshot(q, snap => {
      setCompletedJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [currentUser]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const acceptJob = async (job) => {
    setBusyJobId(job.id);
    try {
      await updateDoc(doc(db, 'orders', job.id), {
        status: 'accepted',
        buddyId: currentUser.uid,
        buddyName: currentUser.displayName || 'Buddy',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      flash('✅ Job accepted! Head to the customer now.');
      setExpandedJob(null);
    } catch (e) {
      flash('Something went wrong. Try again.', 'error');
    } finally { setBusyJobId(null); }
  };

  const startJob = async (jobId) => {
    setBusyJobId(jobId);
    try {
      await updateDoc(doc(db, 'orders', jobId), {
        status: 'in_progress',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      flash('🚀 Job started — good luck!');
    } catch { flash('Something went wrong.', 'error'); }
    finally { setBusyJobId(null); }
  };

  const completeJob = async (job) => {
    setBusyJobId(job.id);
    try {
      await updateDoc(doc(db, 'orders', job.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        buddyEarnings: job.serviceFee || 0,
      });
      // Update buddy total earnings
      const buddyRef = doc(db, 'users', currentUser.uid);
      const buddySnap = await getDoc(buddyRef);
      const currentEarnings = buddySnap.data()?.totalEarnings || 0;
      const currentCount = buddySnap.data()?.completedJobs || 0;
      await updateDoc(buddyRef, {
        totalEarnings: currentEarnings + (job.serviceFee || 0),
        completedJobs: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
      flash('🎉 Job completed! Earnings added to your account.');
    } catch { flash('Something went wrong.', 'error'); }
    finally { setBusyJobId(null); }
  };

  const declineJob = async (job) => {
    setBusyJobId(job.id);
    try {
      await updateDoc(doc(db, 'orders', job.id), {
        declinedBy: arrayUnion(currentUser.uid),
        updatedAt: serverTimestamp(),
      });
      flash('Job skipped.');
    } catch { flash('Something went wrong.', 'error'); }
    finally { setBusyJobId(null); }
  };

  const toggleOnline = async () => {
    setSavingOnline(true);
    const next = !online;
    setOnline(next);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        isOnline: next,
        lastSeen: serverTimestamp(),
      });
    } catch {}
    setSavingOnline(false);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const visibleJobs = availableJobs.filter(j =>
    !(j.declinedBy || []).includes(currentUser?.uid)
  );
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0,0,0,0);

  const weekEarnings = completedJobs
    .filter(j => j.completedAt?.toDate && j.completedAt.toDate() >= thisWeekStart)
    .reduce((s, j) => s + (j.buddyEarnings || j.serviceFee || 0), 0);

  const totalEarnings = buddyProfile?.totalEarnings || 0;
  const totalCompleted = buddyProfile?.completedJobs || 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
        <div style={{ color: theme.muted, fontFamily: "'Inter',sans-serif" }}>Loading your dashboard...</div>
      </div>
    </div>
  );

  const s = {
    inp: { width: '100%', background: theme.card2, border: `1.5px solid ${theme.border}`, borderRadius: 10, padding: '11px 14px', color: theme.text, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none' },
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;}
        .job-card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.1);}
        .tab-btn:hover{background:${theme.card2};}
        .action-btn:hover{opacity:0.88;transform:translateY(-1px);}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .flash-bar{animation:slideDown .25s ease both;}
      `}</style>

      {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
      <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, height: 60 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
            <span style={{ fontSize: 24 }}>🤝</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'Outfit',sans-serif", lineHeight: 1.1 }}>OnlyBuddy</div>
              <div style={{ fontSize: 10, color: theme.muted, fontWeight: 600 }}>BUDDY HQ</div>
            </div>
          </Link>

          {/* Online toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: theme.muted, fontWeight: 600 }}>
              {online ? 'Online' : 'Offline'}
            </span>
            <div
              onClick={!savingOnline ? toggleOnline : undefined}
              style={{ width: 44, height: 24, borderRadius: 12, background: online ? '#059669' : theme.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: 3, left: online ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          <button onClick={() => logout().then(() => navigate('/login'))} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 12px', color: theme.muted, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Sign Out</button>
        </div>
      </div>

      {/* ── FLASH MESSAGE ────────────────────────────────────────────────── */}
      {actionMsg && (
        <div className="flash-bar" style={{ background: actionType === 'error' ? '#FEE2E2' : '#D1FAE5', color: actionType === 'error' ? '#DC2626' : '#065F46', padding: '10px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, borderBottom: `1px solid ${actionType === 'error' ? '#FCA5A5' : '#6EE7B7'}` }}>
          {actionMsg}
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 20px 80px' }}>

        {/* ── BUDDY HEADER CARD ───────────────────────────────────────────── */}
        <div style={{ background: isDark ? 'linear-gradient(135deg,#1E1B4B,#312E81)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 20, padding: '24px 28px', marginBottom: 20, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {currentUser?.displayName?.[0]?.toUpperCase() || '👤'}
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>
                Hey {currentUser?.displayName?.split(' ')[0] || 'Buddy'} 👋
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
                {buddyProfile?.tier ? TIER_CONFIG[buddyProfile.tier]?.label : '🌱 New Buddy'} · {totalCompleted} jobs done
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{fmtCurrency(weekEarnings)}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>This week</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{fmtCurrency(totalEarnings)}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>All time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit',sans-serif" }}>{visibleJobs.length}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Jobs waiting</div>
              </div>
            </div>
          </div>

          {/* Status not approved warning */}
          {buddyProfile?.status === 'pending' && (
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
              ⏳ Your account is pending admin approval. You cannot accept jobs yet.
            </div>
          )}
          {buddyProfile?.status === 'rejected' && (
            <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
              ❌ Your application was not approved. Contact us at hello@onlybuddy.co.uk
            </div>
          )}
        </div>

        {/* ── ACTIVE JOB ALERT ─────────────────────────────────────────────── */}
        {myJobs.length > 0 && (
          <div style={{ background: '#FEF3C7', border: '2px solid #D97706', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#92400E' }}>You have {myJobs.length} active job{myJobs.length > 1 ? 's' : ''}!</div>
              <div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>Tap the Jobs tab to view and update your progress.</div>
            </div>
            <button onClick={() => setTab('jobs')} style={{ background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>View →</button>
          </div>
        )}

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 4, background: theme.card2, borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {[
            { id: 'jobs',     label: 'Jobs',     badge: visibleJobs.length + myJobs.length },
            { id: 'earnings', label: 'Earnings', badge: 0 },
            { id: 'profile',  label: 'Profile',  badge: 0 },
          ].map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', background: tab === t.id ? theme.card : 'transparent', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: tab === t.id ? theme.text : theme.muted, boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {t.label}
              {t.badge > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            JOBS TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'jobs' && (
          <div>

            {/* Active jobs */}
            {myJobs.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>⚡ Your Active Jobs</div>
                {myJobs.map(job => (
                  <ActiveJobCard key={job.id} job={job} theme={theme} isDark={isDark} onStart={startJob} onComplete={completeJob} busy={busyJobId === job.id} />
                ))}
              </div>
            )}

            {/* Available jobs */}
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Available Jobs ({visibleJobs.length})
              </div>
              {!online && (
                <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>You are offline — go online to accept jobs</div>
              )}
            </div>

            {visibleJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: theme.card, borderRadius: 18, border: `1px dashed ${theme.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>No jobs right now</div>
                <div style={{ fontSize: 13, color: theme.muted }}>New jobs will appear here instantly. Make sure you're online!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visibleJobs.map(job => (
                  <AvailableJobCard
                    key={job.id}
                    job={job}
                    theme={theme}
                    isDark={isDark}
                    expanded={expandedJob === job.id}
                    onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    onAccept={() => acceptJob(job)}
                    onDecline={() => declineJob(job)}
                    busy={busyJobId === job.id}
                    canAccept={buddyProfile?.status === 'approved' && online}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            EARNINGS TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'earnings' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'This Week', value: fmtCurrency(weekEarnings), icon: '📅', color: '#4F46E5' },
                { label: 'All Time', value: fmtCurrency(totalEarnings), icon: '💰', color: '#059669' },
                { label: 'Jobs Done', value: totalCompleted, icon: '✅', color: '#D97706' },
              ].map(stat => (
                <div key={stat.label} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '16px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, fontFamily: "'Outfit',sans-serif" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2, fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Payout info */}
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>💳 Payouts</div>
              <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.8 }}>
                Earnings are paid every <strong style={{ color: theme.text }}>Friday</strong> via bank transfer.
                Make sure your bank details are up to date in your Profile tab.<br /><br />
                <strong style={{ color: theme.text }}>Minimum payout: £10.</strong> Amounts below this roll over to next week.
              </div>
            </div>

            {/* Completed jobs list */}
            <div style={{ fontSize: 12, fontWeight: 800, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
              Completed Jobs ({completedJobs.length})
            </div>

            {completedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: theme.card, borderRadius: 16, border: `1px dashed ${theme.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>No completed jobs yet</div>
                <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>Accept a job and complete it to see your earnings here.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completedJobs.map(job => (
                  <div key={job.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{ERRAND_ICONS[job.errandType] || '📋'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{job.errandType}</div>
                      <div style={{ fontSize: 12, color: theme.muted }}>{job.address} · {timeAgo(job.completedAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#059669', fontFamily: "'Outfit',sans-serif" }}>{fmtCurrency(job.buddyEarnings || job.serviceFee)}</div>
                      <div style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>earned</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PROFILE TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'profile' && buddyProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BuddyProfileCard profile={buddyProfile} user={currentUser} theme={theme} isDark={isDark} flash={flash} />
          </div>
        )}

      </div>
    </div>
  );
}

// ── AVAILABLE JOB CARD ───────────────────────────────────────────────────────
function AvailableJobCard({ job, theme, isDark, expanded, onToggle, onAccept, onDecline, busy, canAccept }) {
  const fee = job.serviceFee || 0;
  return (
    <div className="job-card" style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: 18, overflow: 'hidden', transition: 'box-shadow 0.15s' }}>
      {/* Summary row */}
      <div onClick={onToggle} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: isDark ? '#1E293B' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {ERRAND_ICONS[job.errandType] || '📋'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: "'Outfit',sans-serif" }}>{job.errandType}</div>
          <div style={{ fontSize: 12, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            📍 {job.postcode} · {timeAgo(job.createdAt)}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#059669', fontFamily: "'Outfit',sans-serif" }}>£{fee.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: theme.muted }}>your cut</div>
        </div>
        <div style={{ fontSize: 18, color: theme.muted, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>⌄</div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${theme.border}`, padding: '16px 18px', background: isDark ? theme.bg2 : '#FAFAFA' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <InfoPill label="Deliver to" value={job.address} theme={theme} />
            <InfoPill label="Postcode" value={job.postcode} theme={theme} />
            {job.store && <InfoPill label="Store" value={job.store} theme={theme} />}
            {job.errandId === 'queue' && <InfoPill label="Location" value={job.queueLocation} theme={theme} />}
            {job.estimatedMinutes && <InfoPill label="Queue time" value={`~${job.estimatedMinutes} min`} theme={theme} />}
            {job.buyDescription && <InfoPill label="Item needed" value={job.buyDescription} theme={theme} />}
            {job.buyShop && <InfoPill label="Shop" value={job.buyShop} theme={theme} />}
          </div>

          {/* Grocery items */}
          {job.items && job.items.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Shopping List</div>
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {job.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < job.items.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                    <span style={{ fontSize: 18 }}>{item.emoji || '🛒'}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{item.qty}× {item.name}</span>
                      <span style={{ fontSize: 12, color: theme.muted }}> · {item.brand} · {item.unit}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>~£{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', background: isDark ? theme.bg : '#F0FDF4', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: theme.muted }}>Basket estimate</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>~£{(job.basketEstimate || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {job.notes && (
            <div style={{ marginBottom: 16, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400E' }}>
              📝 <strong>Note:</strong> {job.notes}
            </div>
          )}

          {/* CTA */}
          {canAccept ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onDecline} disabled={busy} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1.5px solid ${theme.border}`, background: theme.card, color: theme.muted, fontSize: 14, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Skip
              </button>
              <button onClick={onAccept} disabled={busy} className="action-btn" style={{ flex: 3, padding: '12px', borderRadius: 12, border: 'none', background: busy ? '#9CA3AF' : 'linear-gradient(135deg,#059669,#047857)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all 0.15s' }}>
                {busy ? '⏳ Accepting...' : `✅ Accept — Earn £${fee.toFixed(2)}`}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', fontSize: 13, color: theme.muted, background: theme.card2, borderRadius: 10, padding: 12 }}>
              {!canAccept && buddyProfile?.status !== 'approved' ? '⏳ Pending approval' : '⚫ Go online to accept jobs'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ACTIVE JOB CARD ──────────────────────────────────────────────────────────
function ActiveJobCard({ job, theme, isDark, onStart, onComplete, busy }) {
  const isInProgress = job.status === 'in_progress';
  return (
    <div style={{ background: theme.card, border: `2px solid ${isInProgress ? '#D97706' : '#2563EB'}`, borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ background: isInProgress ? '#D97706' : '#2563EB', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {isInProgress ? '🚀 In Progress' : '✅ Accepted — Get Moving!'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{timeAgo(job.acceptedAt)}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span style={{ fontSize: 28 }}>{ERRAND_ICONS[job.errandType] || '📋'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, fontFamily: "'Outfit',sans-serif" }}>{job.errandType}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>📍 {job.address}, {job.postcode}</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#059669', fontFamily: "'Outfit',sans-serif" }}>£{(job.serviceFee || 0).toFixed(2)}</div>
        </div>

        {job.items && job.items.length > 0 && (
          <div style={{ background: isDark ? theme.bg : '#F8FAFC', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: theme.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Shopping List · {job.store}</div>
            {job.items.map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: theme.text, marginBottom: 4 }}>
                {item.emoji} {item.qty}× <strong>{item.name}</strong> <span style={{ color: theme.muted }}>({item.brand}, {item.unit})</span>
              </div>
            ))}
          </div>
        )}

        {job.notes && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400E', marginBottom: 14 }}>
            📝 {job.notes}
          </div>
        )}

        {!isInProgress ? (
          <button onClick={() => onStart(job.id)} disabled={busy} className="action-btn" style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: busy ? '#9CA3AF' : 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all 0.15s' }}>
            {busy ? '⏳ Updating...' : '🚀 I\'m On My Way'}
          </button>
        ) : (
          <button onClick={() => onComplete(job)} disabled={busy} className="action-btn" style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: busy ? '#9CA3AF' : 'linear-gradient(135deg,#059669,#047857)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all 0.15s' }}>
            {busy ? '⏳ Completing...' : `✅ Mark as Complete — Earn £${(job.serviceFee||0).toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  );
}

// ── PROFILE CARD ─────────────────────────────────────────────────────────────
function BuddyProfileCard({ profile, user, theme, isDark, flash }) {
  const [bankName, setBankName] = useState(profile.bankName || '');
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '');
  const [sortCode, setSortCode] = useState(profile.sortCode || '');
  const [saving, setSaving] = useState(false);

  const saveBank = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        bankName, accountNumber, sortCode, updatedAt: serverTimestamp()
      });
      flash('✅ Bank details saved!');
    } catch { flash('Failed to save. Try again.', 'error'); }
    finally { setSaving(false); }
  };

  const inp = { width: '100%', background: theme.card2, border: `1.5px solid ${theme.border}`, borderRadius: 10, padding: '11px 14px', color: theme.text, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none', marginBottom: 10 };

  return (
    <>
      {/* Account info */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: '20px 22px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>👤 Account Info</div>
        {[
          ['Name', user.displayName || '—'],
          ['Email', user.email || '—'],
          ['Phone', profile.phone || '—'],
          ['Status', profile.status === 'approved' ? '✅ Approved' : profile.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'],
          ['Tier', profile.tier ? (TIER_CONFIG[profile.tier]?.label || profile.tier) : '🌱 New Buddy'],
          ['Member since', profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: 13, color: theme.muted }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Bank details */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: '20px 22px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>🏦 Bank Details (for weekly payouts)</div>
        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 16 }}>Stored securely. Only used to send your weekly earnings.</div>
        <input style={inp} placeholder="Account holder name" value={bankName} onChange={e => setBankName(e.target.value)} />
        <input style={inp} placeholder="Account number (8 digits)" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} maxLength={8} />
        <input style={inp} placeholder="Sort code (e.g. 40-47-84)" value={sortCode} onChange={e => setSortCode(e.target.value)} maxLength={8} />
        <button onClick={saveBank} disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg,#4F46E5,#4338CA)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif" }}>
          {saving ? 'Saving...' : 'Save Bank Details'}
        </button>
      </div>

      {/* Support */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: '20px 22px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'Outfit',sans-serif", marginBottom: 12 }}>💬 Need Help?</div>
        {[
          ['📧 Email', 'hello@onlybuddy.co.uk'],
          ['💬 WhatsApp', '07XXX XXXXXX'],
        ].map(([k, v]) => (
          <div key={k} style={{ fontSize: 13, color: theme.muted, marginBottom: 8 }}>{k}: <strong style={{ color: theme.text }}>{v}</strong></div>
        ))}
      </div>
    </>
  );
}

// ── SMALL INFO PILL ──────────────────────────────────────────────────────────
function InfoPill({ label, value, theme }) {
  if (!value) return null;
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '8px 12px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

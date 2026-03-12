import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, getDocs, query, orderBy, where, serverTimestamp } from 'firebase/firestore';

const TABS = ['Overview', 'Applications', 'Orders', 'Buddies'];
const TIER_CONFIG = {
  new:     { label: '🌱 New Buddy',     color: '#D97706', maxOrder: 20  },
  trusted: { label: '⭐ Trusted Buddy', color: '#2563EB', maxOrder: 50  },
  top:     { label: '🏆 Top Buddy',     color: '#059669', maxOrder: 999 },
};

export default function AdminDashboard() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState('Overview');
  const [applications, setApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!selectedApp) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelectedApp(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedApp]);

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, 'applications'), orderBy('createdAt', 'desc')),
      snap => { setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false)
    );
    const unsub2 = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    const unsub3 = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'buddy')),
      snap => setBuddies(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const approveApplication = async (app) => {
    try {
      // Update application doc
      await updateDoc(doc(db, 'applications', app.id), { status: 'approved', updatedAt: serverTimestamp() });
      // Promote their user account to buddy role
      const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', app.email)));
      if (!userSnap.empty) {
        await updateDoc(doc(db, 'users', userSnap.docs[0].id), {
          role: 'buddy', status: 'approved', tier: 'new', updatedAt: serverTimestamp(),
        });
      }
      setActionMsg('✅ ' + app.fullName + ' approved — they can now log in as a Buddy!');
      setTimeout(() => setActionMsg(''), 4000);
      setSelectedApp(null);
    } catch { setActionMsg('⚠️ Failed to approve — try again.'); setTimeout(() => setActionMsg(''), 3000); }
  };

  const rejectApplication = async (app) => {
    try {
      await updateDoc(doc(db, 'applications', app.id), { status: 'rejected', updatedAt: serverTimestamp() });
      // Mark user account as rejected too (if they have one)
      const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', app.email)));
      if (!userSnap.empty) {
        await updateDoc(doc(db, 'users', userSnap.docs[0].id), { status: 'rejected', updatedAt: serverTimestamp() });
      }
      setActionMsg('❌ ' + app.fullName + ' rejected.');
      setTimeout(() => setActionMsg(''), 3000);
      setSelectedApp(null);
    } catch { setActionMsg('⚠️ Failed to reject — try again.'); setTimeout(() => setActionMsg(''), 3000); }
  };

  const upgradeTier = async (buddyId, newTier) => {
    try {
      await updateDoc(doc(db, 'users', buddyId), { tier: newTier, updatedAt: serverTimestamp() });
      setActionMsg('⬆️ Tier updated!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('⚠️ Failed to update tier — try again.'); setTimeout(() => setActionMsg(''), 3000); }
  };

  const pending = applications.filter(a => a.status === 'pending');
  const liveOrders = orders.filter(o => o.status === 'in_progress');
  const todayRevenue = orders.filter(o => {
    if (!o.createdAt?.toDate) return false;
    return o.createdAt.toDate().toDateString() === new Date().toDateString();
  }).reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      <style>{`::-webkit-scrollbar{display:none}`}</style>

      <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary, fontFamily: "'Outfit', sans-serif" }}>OnlyBuddy Admin</div>
          <div style={{ fontSize: 11, color: theme.muted }}>Hull Operations · Live Dashboard</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pending.length > 0 && <div style={{ background: theme.red, color: '#fff', borderRadius: 20, fontSize: 12, fontWeight: 700, padding: '4px 12px' }}>{pending.length} pending</div>}
          <div style={{ background: theme.greenBg, color: theme.green, border: `1px solid ${theme.green}33`, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '4px 12px' }}>● Live</div>
          <button onClick={toggleTheme} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isDark ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {actionMsg && <div style={{ background: theme.greenBg, borderBottom: `1px solid ${theme.green}33`, padding: '10px 24px', fontSize: 14, fontWeight: 600, color: theme.green }}>{actionMsg}</div>}

      <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '0 24px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? theme.primary : 'transparent'}`, color: tab === t ? theme.primary : theme.muted, fontWeight: tab === t ? 700 : 500, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', position: 'relative' }}>
            {t}{t === 'Applications' && pending.length > 0 && <span style={{ position: 'absolute', top: 8, right: 2, background: theme.red, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

        {tab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              {[
                { label: "Today's Revenue", value: `£${todayRevenue.toFixed(2)}`, icon: '💷', color: theme.green },
                { label: 'Live Orders', value: liveOrders.length, icon: '⚡', color: theme.primary },
                { label: 'Total Orders', value: orders.length, icon: '📋', color: '#2563EB' },
                { label: 'Approved Buddies', value: buddies.filter(b => b.status === 'approved').length, icon: '🏃', color: '#D97706' },
                { label: 'Pending Applications', value: pending.length, icon: '📥', color: theme.red },
                { label: 'Total Applications', value: applications.length, icon: '📝', color: theme.muted },
              ].map(s => (
                <div key={s.label} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 26 }}>{s.icon}</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 8 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {pending.length > 0 && (
              <div style={{ background: theme.card, border: `1px solid ${theme.red}44`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 14, color: theme.red }}>🚨 {pending.length} Application{pending.length > 1 ? 's' : ''} Awaiting Review</div>
                {pending.slice(0, 3).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{a.fullName}</div>
                      <div style={{ fontSize: 12, color: theme.muted }}>{a.phone} · {a.postcode} · {a.vehicleType}</div>
                    </div>
                    <button onClick={() => { setSelectedApp(a); setTab('Applications'); }} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${theme.primary}44`, background: theme.primaryBg, color: theme.primary, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Review →</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 14 }}>📋 Recent Orders</div>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: theme.muted, fontSize: 14 }}>No orders yet — share your booking link!</div>
              ) : orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.border}`, fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.errandType} · {(o.description || '').substring(0, 50)}</div>
                    <div style={{ color: theme.muted, fontSize: 12 }}>{o.customerName} · {o.postcode} · {o.createdAt?.toDate?.()?.toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: theme.primary }}>£{(o.total || 0).toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: o.status === 'completed' ? theme.green : theme.muted }}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Applications' && (
          <div>
            {selectedApp && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSelectedApp(null)}>
                <div style={{ background: theme.card, borderRadius: 20, padding: 32, maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>{selectedApp.fullName}</div>
                      <div style={{ fontSize: 13, color: theme.muted }}>{selectedApp.email} · {selectedApp.phone}</div>
                    </div>
                    <button onClick={() => setSelectedApp(null)} style={{ background: theme.bg2, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                  {[
                    ['Address', `${selectedApp.address}, ${selectedApp.postcode}`],
                    ['Date of Birth', selectedApp.dob],
                    ['NI Number', selectedApp.niNumber],
                    ['Vehicle', selectedApp.vehicleType],
                    ['Preferred Zones', selectedApp.preferredZones?.join(', ')],
                    ['Emergency Contact', `${selectedApp.emergencyName} (${selectedApp.emergencyRelation}) — ${selectedApp.emergencyPhone}`],
                    ['Experience', selectedApp.experience || 'Not provided'],
                    ['Why a Buddy', selectedApp.whyBuddy],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, marginBottom: 2 }}>{k.toUpperCase()}</div>
                      <div style={{ fontSize: 14 }}>{v}</div>
                    </div>
                  ))}
                  {(selectedApp.idPhotoUrl || selectedApp.selfieUrl) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                      {selectedApp.idPhotoUrl && <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.muted, marginBottom: 6 }}>PHOTO ID</div><img src={selectedApp.idPhotoUrl} alt="ID" style={{ width: '100%', borderRadius: 10, border: `1px solid ${theme.border}` }} /></div>}
                      {selectedApp.selfieUrl && <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.muted, marginBottom: 6 }}>SELFIE</div><img src={selectedApp.selfieUrl} alt="Selfie" style={{ width: '100%', borderRadius: 10, border: `1px solid ${theme.border}` }} /></div>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button onClick={() => approveApplication(selectedApp)} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${theme.green}, #047857)`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>✅ Approve</button>
                    <button onClick={() => rejectApplication(selectedApp)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${theme.red}`, background: theme.redBg, color: theme.red, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>❌ Reject</button>
                  </div>
                </div>
              </div>
            )}

            {loading ? <div style={{ textAlign: 'center', padding: 40, color: theme.muted }}>Loading...</div>
            : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: theme.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📥</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No applications yet</div>
                <div style={{ fontSize: 14 }}>Share this link to recruit Buddies:</div>
                <div style={{ marginTop: 12, padding: '12px 20px', background: theme.primaryBg, borderRadius: 12, fontSize: 14, color: theme.primary, fontWeight: 700 }}>onlybuddy.vercel.app/apply</div>
              </div>
            ) : applications.map(a => (
              <div key={a.id} onClick={() => setSelectedApp(a)} style={{ background: theme.card, border: `1px solid ${a.status === 'pending' ? theme.primary + '55' : theme.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: a.status === 'approved' ? theme.greenBg : a.status === 'pending' ? theme.primaryBg : theme.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {a.status === 'approved' ? '✅' : a.status === 'pending' ? '⏳' : '❌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{a.fullName}</div>
                  <div style={{ fontSize: 12, color: theme.muted }}>{a.phone} · {a.postcode} · {a.vehicleType}</div>
                  <div style={{ fontSize: 11, color: theme.muted }}>{a.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: a.status === 'pending' ? theme.primaryBg : a.status === 'approved' ? theme.greenBg : theme.redBg, color: a.status === 'pending' ? theme.primary : a.status === 'approved' ? theme.green : theme.red, textTransform: 'uppercase' }}>{a.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Orders' && (
          <div>
            {orders.length === 0
              ? <div style={{ textAlign: 'center', padding: 60, color: theme.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div><div style={{ fontSize: 16, fontWeight: 700 }}>No orders yet</div></div>
              : orders.map(o => (
                <div key={o.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '16px 20px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{o.errandType}</div>
                      <div style={{ fontSize: 13, color: theme.text2, marginTop: 2 }}>{o.description}</div>
                      <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{o.customerName} · {o.customerPhone} · {o.postcode}</div>
                      <div style={{ fontSize: 11, color: theme.muted }}>{o.createdAt?.toDate?.()?.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary }}>£{(o.total || 0).toFixed(2)}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: o.status === 'completed' ? theme.green : theme.muted }}>{o.status}</div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'Buddies' && (
          <div>
            {buddies.length === 0
              ? <div style={{ textAlign: 'center', padding: 60, color: theme.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>🏃</div><div style={{ fontSize: 16, fontWeight: 700 }}>No Buddies yet — approve applications first</div></div>
              : buddies.map(b => {
                const tier = TIER_CONFIG[b.tier || 'new'];
                return (
                  <div key={b.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: theme.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏃</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{b.name || b.email}</div>
                      <div style={{ fontSize: 12, color: theme.muted }}>{b.phone} · {b.postcode}</div>
                      <div style={{ fontSize: 11, color: tier.color, fontWeight: 700, marginTop: 2 }}>{tier.label} · Max £{tier.maxOrder === 999 ? 'Unlimited' : tier.maxOrder}</div>
                    </div>
                    {b.tier !== 'top' && (
                      <button onClick={() => upgradeTier(b.id, b.tier === 'new' ? 'trusted' : 'top')} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${theme.green}44`, background: theme.greenBg, color: theme.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>⬆️ Upgrade Tier</button>
                    )}
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
}

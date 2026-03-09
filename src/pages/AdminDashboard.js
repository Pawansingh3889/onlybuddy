import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useTheme } from '../contexts/ThemeContext';
import { Card, Badge, StatusBadge, SectionTitle, Spinner } from '../components/UI';
import { MOCK_RUNNERS, MOCK_ORDERS } from '../data';

export default function AdminDashboard() {
  const { theme: T } = useTheme();
  const [tab, setTab]         = useState('overview');
  const [liveJobs, setLiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt','desc'));
      const unsub = onSnapshot(q, snap => {
        setLiveJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false));
      return () => unsub();
    } catch { setLoading(false); }
  }, []);

  const allJobs   = liveJobs.length > 0 ? liveJobs : MOCK_ORDERS;
  const activeN   = allJobs.filter(j => j.status === 'accepted' || j.status === 'in_progress').length;
  const todayRev  = allJobs.reduce((s,j) => s + (parseFloat(j.total||j.pay||0)), 0);

  const hdr = { padding:'16px 16px 12px', background:T.card,
    borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 };

  return (
    <div style={{ background:T.bg, minHeight:'100vh', width:'100%', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} *{box-sizing:border-box} ::-webkit-scrollbar{display:none}`}</style>

      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={hdr}>
          <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>📊 Admin Dashboard</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>OnlyBuddy Operations · Hull</div>
        </div>

        {/* Nav pills */}
        <div style={{ padding:'12px 16px 0', display:'flex', gap:8, overflowX:'auto' }}>
          {['overview','jobs','buddies'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'7px 16px', borderRadius:20,
                background: tab===t ? T.primary : T.card2,
                color: tab===t ? '#fff' : T.muted,
                border: `1px solid ${tab===t ? T.primary : T.border}`,
                fontWeight:700, fontSize:13, cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif", textTransform:'capitalize',
                flexShrink:0, transition:'all 0.18s' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>

          {/* OVERVIEW */}
          {tab==='overview' && (
            <div style={{ animation:'fadeUp 0.3s ease', display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Live Jobs',    value:activeN,                       icon:'🔴', color:T.red    },
                  { label:"Today's Jobs", value:allJobs.length,                icon:'📋', color:T.primary},
                  { label:'Online Buddies',value:MOCK_RUNNERS.filter(r=>r.online).length, icon:'🏃', color:T.green },
                  { label:'Revenue',      value:`£${todayRev.toFixed(2)}`,     icon:'💷', color:T.accent },
                ].map(s => (
                  <Card key={s.label} style={{ padding:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ fontSize:24 }}>{s.icon}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:0.5 }}>{s.label.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize:26, fontWeight:900, color:s.color, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <SectionTitle>Recent Activity</SectionTitle>
                {loading ? <Spinner /> : allJobs.slice(0,6).map((j,i) => (
                  <div key={j.id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                    borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:22 }}>📦</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>
                        {j.task || j.title || 'Job'}
                      </div>
                      <div style={{ fontSize:11, color:T.muted }}>
                        {j.customerEmail || j.customer || '—'} · {j.deliveryAddress || j.address || '—'}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <StatusBadge status={j.status || 'placed'} />
                      <div style={{ fontSize:12, fontWeight:700, color:T.primary, marginTop:4 }}>
                        £{parseFloat(j.pay||j.total||0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* JOBS */}
          {tab==='jobs' && (
            <div style={{ animation:'fadeUp 0.3s ease', display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ fontSize:13, color:T.muted, padding:'0 2px' }}>
                {liveJobs.length > 0 ? `${liveJobs.length} live jobs from Firebase` : `${MOCK_ORDERS.length} demo jobs`}
              </div>
              {loading ? <Spinner /> : allJobs.map((j,i) => (
                <Card key={j.id||i} style={{ padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{j.task||j.title||'Job'}</div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                        👤 {j.customerEmail||j.customer||'—'}
                      </div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:1 }}>
                        📍 {j.deliveryAddress||j.address||'—'}
                      </div>
                      {j.buddyName && (
                        <div style={{ fontSize:12, color:T.primary, marginTop:1, fontWeight:600 }}>
                          🏃 Buddy: {j.buddyName}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}>
                      <StatusBadge status={j.status||'placed'} />
                      <div style={{ fontSize:14, fontWeight:800, color:T.green, marginTop:6 }}>
                        £{parseFloat(j.pay||j.total||0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* BUDDIES */}
          {tab==='buddies' && (
            <div style={{ animation:'fadeUp 0.3s ease', display:'flex', flexDirection:'column', gap:10 }}>
              {MOCK_RUNNERS.map(r => (
                <Card key={r.id} style={{ padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:'50%',
                      background:T.primaryBg, border:`2px solid ${T.border}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:24, flexShrink:0, position:'relative' }}>
                      {r.avatar}
                      <div style={{ position:'absolute', bottom:0, right:0,
                        width:12, height:12, borderRadius:'50%',
                        background: r.online ? T.green : T.muted,
                        border:`2px solid ${T.card}` }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:15, fontWeight:700, color:T.text, fontFamily:"'Syne',sans-serif" }}>{r.name}</span>
                        {r.badge && <Badge color={T.accent}>{r.badge}</Badge>}
                      </div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                        ⭐ {r.rating} · {r.tasks} tasks · {r.zone}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <Badge color={r.online ? T.green : T.muted}>
                        {r.online ? '● Online' : 'Offline'}
                      </Badge>
                      <div style={{ fontSize:13, fontWeight:700, color:T.primary, marginTop:6 }}>{r.eta}m ETA</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

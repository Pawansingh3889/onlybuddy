// ✅ ALL BUGS FIXED: imports, jobs state, live Firebase, acceptJob with real user name
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button, Avatar, StatusBadge, SectionTitle, Spinner } from '../components/UI';
import { ERRAND_TYPES, CHAT_MESSAGES } from '../data';

const FALLBACK_JOBS = [
  { id:'J1', type:'grocery',  title:'Tesco Express — 5 items',          address:'Newland Ave, HU5', pay:8.00,  distance:'0.4mi', urgent:true  },
  { id:'J2', type:'pharmacy', title:'Collect prescription — Boots Hull', address:'Prospect St, HU2', pay:5.00,  distance:'0.9mi', urgent:false },
  { id:'J3', type:'buy',      title:'Pick up from Argos — ref #12345',   address:'St Stephens, HU1', pay:7.50,  distance:'1.2mi', urgent:false },
  { id:'J4', type:'parcel',   title:'Return parcel to Post Office',       address:'Anlaby Rd, HU3',   pay:4.50,  distance:'0.7mi', urgent:true  },
];

export default function RunnerApp() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [tab, setTab]               = useState('jobs');
  const [online, setOnline]         = useState(true);
  const [activeJob, setActiveJob]   = useState(null);
  const [jobStep, setJobStep]       = useState(0);
  const [chatMsg, setChatMsg]       = useState('');
  const [messages, setMessages]     = useState(CHAT_MESSAGES);
  const [showChat, setShowChat]     = useState(false);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [firebaseJobs, setFirebaseJobs]   = useState([]);
  const [loadingJobs, setLoadingJobs]     = useState(true);

  // ✅ Live listener for jobs with status "searching"
  useEffect(() => {
    const q = query(collection(db, 'jobs'), where('status','==','searching'));
    const unsub = onSnapshot(q, (snap) => {
      const live = snap.docs.map(d => ({
        id:       d.id,
        type:     d.data().type     || 'grocery',
        title:    d.data().task     || 'New Job',
        address:  d.data().deliveryAddress || 'Hull',
        pay:      parseFloat(d.data().pay) || 5.00,
        distance: 'nearby',
        urgent:   false,
        isReal:   true,
      }));
      setFirebaseJobs(live);
      setLoadingJobs(false);
    }, () => { setLoadingJobs(false); });
    return () => unsub();
  }, []);

  const availableJobs = firebaseJobs.length > 0 ? firebaseJobs : FALLBACK_JOBS;

  // ✅ acceptJob uses real user name/email
  const acceptJob = async (job) => {
    try {
      if (job.isReal) {
        await updateDoc(doc(db, 'jobs', job.id), {
          status:      'accepted',
          acceptedAt:  serverTimestamp(),
          buddyId:     currentUser?.uid   || 'unknown',
          buddyName:   currentUser?.email?.split('@')[0] || 'Buddy',
          buddyEmail:  currentUser?.email || 'unknown',
        });
      }
      setActiveJob(job);
      setJobStep(0);
      setTab('active');
    } catch (e) {
      console.error(e);
      alert('Could not accept job — it may have been taken!');
    }
  };

  const nextStep = () => {
    if (jobStep < 3) {
      setJobStep(s => s+1);
    } else {
      setCompletedJobs(j => [...j, { ...activeJob, completedAt:'Just now' }]);
      setActiveJob(null);
      setJobStep(0);
      setTab('jobs');
    }
  };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, {
      id:Date.now(), from:'runner', text:chatMsg,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    }]);
    setChatMsg('');
  };

  const jobSteps = ['Head to pick-up','Arrived — collect items','Heading to customer','Mark as delivered'];
  const hdr = { padding:'16px 16px 12px', background:T.card,
    borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 };

  return (
    <div style={{ background:T.bg, minHeight:'100vh', width:'100%', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} *{box-sizing:border-box} ::-webkit-scrollbar{display:none}`}</style>

      <div style={{ flex:1, overflowY:'auto' }}>

        {/* JOBS */}
        {tab==='jobs' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={hdr}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:900, fontFamily:"'Syne',sans-serif",
                    background:`linear-gradient(135deg,${T.primary},${T.primaryLight})`,
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                    backgroundClip:'text' }}>OnlyBuddy 🤝</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Buddy Portal · Hull</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={toggleTheme}
                    style={{ background:T.bg2, border:`1px solid ${T.border}`,
                      borderRadius:10, width:34, height:34, cursor:'pointer',
                      fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isDark?'☀️':'🌙'}
                  </button>
                  <button onClick={() => setOnline(o=>!o)}
                    style={{ background: online ? T.greenBg : T.bg2,
                      border:`1px solid ${online ? T.green : T.border}`,
                      borderRadius:20, padding:'6px 14px',
                      color: online ? T.green : T.muted,
                      fontWeight:700, fontSize:12, cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%',
                      background: online ? T.green : T.muted,
                      display:'inline-block', animation: online ? 'pulse 2s infinite' : 'none' }} />
                    {online ? 'Online' : 'Offline'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[['Today','£47.50','💷'],['Tasks',`${completedJobs.length+5}`,'✅'],['Rating','4.97 ⭐','🏆']].map(([l,v,i]) => (
                  <Card key={l} style={{ textAlign:'center', padding:14 }}>
                    <div style={{ fontSize:22 }}>{i}</div>
                    <div style={{ fontSize:16, fontWeight:900, color:T.primary, fontFamily:"'Syne',sans-serif", marginTop:4 }}>{v}</div>
                    <div style={{ fontSize:10, color:T.muted }}>{l}</div>
                  </Card>
                ))}
              </div>

              {activeJob && (
                <Card onClick={() => setTab('active')}
                  style={{ background:`linear-gradient(135deg,${T.primaryBg},${T.card})`, borderColor:T.primary, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ fontSize:30 }}>{ERRAND_TYPES.find(e=>e.id===activeJob.type)?.icon||'📦'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text }}>🔴 Active: {activeJob.title}</div>
                      <div style={{ fontSize:11, color:T.muted }}>Tap to continue → Step {jobStep+1}/4</div>
                    </div>
                    <Badge color={T.primary}>LIVE</Badge>
                  </div>
                </Card>
              )}

              <div>
                <SectionTitle>
                  {online ? `⚡ Available Jobs (${availableJobs.length})` : '💤 Go Online to See Jobs'}
                </SectionTitle>
                {loadingJobs ? <Spinner /> : !online ? (
                  <Card style={{ textAlign:'center', padding:32 }}>
                    <div style={{ fontSize:48 }}>😴</div>
                    <div style={{ fontSize:16, fontWeight:700, color:T.text, marginTop:10 }}>You're offline</div>
                    <div style={{ fontSize:13, color:T.muted, marginTop:4, marginBottom:16 }}>Go online to start receiving jobs</div>
                    <Button onClick={() => setOnline(true)}>Go Online</Button>
                  </Card>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {availableJobs.map(job => {
                      const et = ERRAND_TYPES.find(e=>e.id===job.type);
                      return (
                        <Card key={job.id} style={{ padding:16, borderLeft:`4px solid ${et?.color||T.primary}` }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                            <div style={{ fontSize:30 }}>{et?.icon||'📦'}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                                <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{job.title}</span>
                                {job.urgent && <Badge color={T.red}>URGENT</Badge>}
                                {job.isReal && <Badge color={T.green}>LIVE</Badge>}
                              </div>
                              <div style={{ fontSize:12, color:T.muted }}>📍 {job.address} · {job.distance}</div>
                            </div>
                            <div style={{ fontSize:20, fontWeight:900, color:T.green, fontFamily:"'Syne',sans-serif", flexShrink:0 }}>
                              £{typeof job.pay==='number' ? job.pay.toFixed(2) : job.pay}
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:8 }}>
                            <Button onClick={() => acceptJob(job)} style={{ flex:1, padding:10 }} disabled={!!activeJob}>
                              {activeJob ? 'Finish current job first' : 'Accept Job ✓'}
                            </Button>
                            <Button variant="secondary" style={{ padding:'10px 14px' }}>Skip</Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE */}
        {tab==='active' && activeJob && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={{ ...hdr, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={() => setTab('jobs')}
                  style={{ background:T.bg2, border:'none', color:T.text, width:34, height:34,
                    borderRadius:10, cursor:'pointer', fontSize:18,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>Active Job</div>
                  <div style={{ fontSize:11, color:T.green }}>● In Progress · £{typeof activeJob.pay==='number'?activeJob.pay.toFixed(2):activeJob.pay}</div>
                </div>
              </div>
              <button onClick={() => setShowChat(!showChat)}
                style={{ background:T.primaryBg, border:`1px solid ${T.primary}44`,
                  color:T.primary, borderRadius:10, padding:'6px 12px',
                  fontWeight:700, fontSize:12, cursor:'pointer',
                  fontFamily:"'DM Sans',sans-serif" }}>💬 Chat</button>
            </div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <Card style={{ background:`linear-gradient(135deg,${ERRAND_TYPES.find(e=>e.id===activeJob.type)?.color||T.primary}18,${T.card})`, padding:18 }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.muted, marginBottom:6, letterSpacing:0.5 }}>CURRENT TASK</div>
                <div style={{ fontSize:16, fontWeight:800, color:T.text, fontFamily:"'Syne',sans-serif" }}>{activeJob.title}</div>
                <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>📍 {activeJob.address}</div>
                <div style={{ fontSize:13, color:T.green, marginTop:4, fontWeight:700 }}>
                  💷 You earn: £{typeof activeJob.pay==='number'?activeJob.pay.toFixed(2):activeJob.pay}
                </div>
              </Card>

              {showChat && (
                <Card style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`, fontWeight:700, fontSize:14, color:T.text }}>💬 Chat with Customer</div>
                  <div style={{ maxHeight:200, overflowY:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                    {messages.map(m => (
                      <div key={m.id} style={{ display:'flex', justifyContent:m.from==='runner'?'flex-end':'flex-start' }}>
                        <div style={{ maxWidth:'76%', background:m.from==='runner'?T.primary:T.card2,
                          color:m.from==='runner'?'#fff':T.text, borderRadius:12, padding:'8px 12px', fontSize:13 }}>
                          {m.text}<div style={{ fontSize:10, opacity:0.6, marginTop:3, textAlign:'right' }}>{m.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'10px 14px', borderTop:`1px solid ${T.border}`, display:'flex', gap:8 }}>
                    <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                      placeholder="Message customer..."
                      style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`,
                        borderRadius:10, padding:'9px 12px', color:T.text, fontSize:13,
                        outline:'none', fontFamily:"'DM Sans',sans-serif" }}
                      onKeyDown={e=>e.key==='Enter'&&sendMsg()} />
                    <button onClick={sendMsg}
                      style={{ background:T.primary, border:'none', color:'#fff',
                        borderRadius:10, padding:'0 14px', fontWeight:700, cursor:'pointer', fontSize:18 }}>↑</button>
                  </div>
                </Card>
              )}

              <Card>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif", color:T.text }}>Your Steps</div>
                {jobSteps.map((step,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0',
                    borderBottom: i<jobSteps.length-1 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%',
                      background: i<jobStep ? T.greenBg : i===jobStep ? T.primaryBg : T.bg2,
                      border:`2px solid ${i<jobStep ? T.green : i===jobStep ? T.primary : T.border}`,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      {i<jobStep?'✅':i===jobStep?'🔴':<span style={{ color:T.muted, fontSize:12 }}>○</span>}
                    </div>
                    <div style={{ fontSize:13, fontWeight:i===jobStep?700:400,
                      color:i<=jobStep?T.text:T.muted }}>{step}</div>
                  </div>
                ))}
              </Card>

              <Button onClick={nextStep} fullWidth size="lg">
                {jobStep<3 ? `✓ ${jobSteps[jobStep]}` : '🎉 Mark as Delivered'}
              </Button>
            </div>
          </div>
        )}

        {/* EARNINGS */}
        {tab==='earnings' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={hdr}>
              <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>My Earnings</div>
            </div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDark} 60%,#3730a3)`,
                borderRadius:20, padding:28, color:'#fff', textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>THIS WEEK</div>
                <div style={{ fontSize:42, fontWeight:900, fontFamily:"'Syne',sans-serif", marginTop:4 }}>£127.50</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:4 }}>Next payout: Friday · Bank Transfer</div>
                <div style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', fontSize:64, opacity:0.12 }}>💷</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['This Month','£412.00'],['Total Earned','£3,847.50'],['Avg per task','£6.26'],['Tasks done','614']].map(([l,v]) => (
                  <Card key={l} style={{ padding:16 }}>
                    <div style={{ fontSize:20, fontWeight:900, color:T.primary, fontFamily:"'Syne',sans-serif" }}>{v}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>{l}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={hdr}>
              <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>Buddy Profile</div>
            </div>
            <div style={{ padding:16 }}>
              <Card style={{ display:'flex', alignItems:'center', gap:16, padding:20, marginBottom:14 }}>
                <Avatar emoji="🧑‍🦱" size={60} online={online} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>
                    {currentUser?.email?.split('@')[0] || 'Buddy'}
                  </div>
                  <div style={{ fontSize:13, color:T.muted }}>{currentUser?.email}</div>
                  <div style={{ fontSize:13, color:T.primary, fontWeight:700, marginTop:4 }}>⭐ 4.97 · {completedJobs.length+842} tasks</div>
                </div>
                <Badge color={T.accent}>TOP BUDDY</Badge>
              </Card>
              <Card>
                {['Edit profile','Vehicle details','Bank account','DBS certificate','Help & support','Terms & conditions'].map(item => (
                  <div key={item} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'12px 0', borderBottom:`1px solid ${T.border}`,
                    fontSize:14, color:T.text2, cursor:'pointer' }}>
                    <span>{item}</span><span style={{ color:T.muted }}>›</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </div>

      <nav style={{ position:'sticky', bottom:0, width:'100%',
        background:T.navBg, borderTop:`1px solid ${T.border}`,
        display:'flex', backdropFilter:'blur(12px)', zIndex:200 }}>
        {[{id:'jobs',icon:'⚡',label:'Jobs',badge:online?availableJobs.length:0},
          {id:'active',icon:'🔴',label:'Active',badge:activeJob?1:0},
          {id:'earnings',icon:'💷',label:'Earnings',badge:0},
          {id:'profile',icon:'👤',label:'Profile',badge:0}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:'10px 4px 12px', background:'none', border:'none',
              color:tab===t.id?T.primary:T.muted,
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              borderTop:tab===t.id?`2px solid ${T.primary}`:'2px solid transparent' }}>
            <div style={{ position:'relative' }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              {t.badge>0 && <span style={{ position:'absolute', top:-4, right:-8,
                background:T.primary, color:'#fff', borderRadius:10,
                fontSize:9, fontWeight:700, padding:'1px 5px',
                minWidth:16, textAlign:'center' }}>{t.badge}</span>}
            </div>
            <span style={{ fontSize:10, fontWeight:tab===t.id?700:500 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button, Input, Avatar, StatusBadge, SectionTitle, Spinner } from '../components/UI';
import { ERRAND_TYPES, MOCK_ORDERS, MOCK_RUNNERS, TRACK_STEPS, CHAT_MESSAGES } from '../data';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function BookingFlow({ errand, onComplete, onBack }) {
  const { theme: T } = useTheme();
  const { currentUser } = useAuth();
  const [step, setStep]               = useState(0);
  const [taskText, setTaskText]       = useState('');
  const [address, setAddress]         = useState('');
  const [budget, setBudget]           = useState('8');
  const [selectedRunner, setSelectedRunner] = useState(null);
  const [trackStep, setTrackStep]     = useState(0);
  const [chatMsg, setChatMsg]         = useState('');
  const [messages, setMessages]       = useState(CHAT_MESSAGES);
  const [rating, setRating]           = useState(0);
  const [showChat, setShowChat]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');

  const submitJob = async () => {
    setFormError('');
    if (!taskText.trim()) return setFormError('Please describe your errand.');
    if (!address.trim())  return setFormError('Please enter your delivery address.');
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        type:            errand.id,
        task:            taskText.trim(),
        deliveryAddress: address.trim(),
        pay:             budget,
        status:          'searching',
        customerEmail:   currentUser?.email || 'guest',
        customerId:      currentUser?.uid   || 'guest',
        createdAt:       serverTimestamp(),
      });
      setStep(1);
    } catch (e) {
      console.error(e);
      setFormError('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  const startTracking = (runner) => {
    setSelectedRunner(runner);
    setStep(2);
    let s = 0;
    const t = setInterval(() => {
      s++;
      setTrackStep(s);
      if (s >= TRACK_STEPS.length - 1) clearInterval(t);
    }, 2500);
  };

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, {
      id: Date.now(), from:'customer', text: chatMsg,
      time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    }]);
    setChatMsg('');
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now()+1, from:'runner', text:"Got it! I'll take care of that 👍",
        time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
      }]);
    }, 1200);
  };

  const stickyHeader = { padding:'14px 16px', borderBottom:`1px solid ${T.border}`,
    display:'flex', alignItems:'center', gap:10, background:T.card,
    position:'sticky', top:0, zIndex:10 };
  const backBtn = { background:T.bg2, border:'none', color:T.text,
    width:34, height:34, borderRadius:10, cursor:'pointer', fontSize:18,
    display:'flex', alignItems:'center', justifyContent:'center' };

  // ── Step 0: Fill in details ──
  if (step === 0) return (
    <div>
      <div style={stickyHeader}>
        <button onClick={onBack} style={backBtn}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>
            {errand.icon} {errand.label}
          </div>
          <div style={{ fontSize:11, color:T.muted }}>Describe your task</div>
        </div>
      </div>
      <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:errand.color+'15', border:`1px solid ${errand.color}33`,
          borderRadius:12, padding:'10px 14px' }}>
          <div style={{ fontSize:12, color:errand.color, fontWeight:600 }}>💡 Example: {errand.ex}</div>
        </div>

        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.muted, marginBottom:6, letterSpacing:0.5 }}>DESCRIBE YOUR ERRAND *</div>
          <Input value={taskText} onChange={e=>setTaskText(e.target.value)}
            placeholder={errand.ex.replace('e.g. ','')} multiline rows={3} />
        </div>

        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.muted, marginBottom:6, letterSpacing:0.5 }}>📍 DELIVERY ADDRESS *</div>
          <Input value={address} onChange={e=>setAddress(e.target.value)}
            placeholder="e.g. 14 Newland Ave, Hull HU5 2RQ" icon="📍" />
        </div>

        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.muted, marginBottom:8, letterSpacing:0.5 }}>💷 SERVICE FEE</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['5','8','10','15','20'].map(v => (
              <button key={v} onClick={() => setBudget(v)}
                style={{ padding:'8px 16px', borderRadius:10,
                  border:`1.5px solid ${budget===v ? errand.color : T.border}`,
                  background: budget===v ? errand.color+'22' : T.card2,
                  color: budget===v ? errand.color : T.muted,
                  fontWeight:700, fontSize:14, cursor:'pointer',
                  fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s' }}>
                £{v}
              </button>
            ))}
          </div>
          <div style={{ fontSize:11, color:T.muted, marginTop:6 }}>You only pay after the task is completed ✓</div>
        </div>

        <div style={{ background:T.primaryBg, border:`1px solid ${T.primary}33`,
          borderRadius:12, padding:'10px 14px' }}>
          <div style={{ fontSize:12, color:T.text2 }}>⏱ Buddy arrives <strong style={{ color:T.primary }}>within 30 minutes</strong></div>
          <div style={{ fontSize:12, color:T.text2, marginTop:4 }}>💳 Pay securely after completion</div>
          <div style={{ fontSize:12, color:T.text2, marginTop:4 }}>🔒 Fully insured · Verified Buddies only</div>
        </div>

        {formError && (
          <div style={{ background:T.redBg, border:`1px solid ${T.red}`,
            borderRadius:10, padding:'10px 14px', fontSize:13, color:T.red }}>
            ⚠️ {formError}
          </div>
        )}

        <Button onClick={submitJob} variant="primary" fullWidth
          disabled={submitting} style={{ marginTop:4 }}>
          {submitting ? '⏳ Submitting...' : 'Confirm & Find Buddy →'}
        </Button>
      </div>
    </div>
  );

  // ── Step 1: Choose runner ──
  if (step === 1) return (
    <div>
      <div style={stickyHeader}>
        <button onClick={() => setStep(0)} style={backBtn}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>Choose Your Buddy</div>
          <div style={{ fontSize:11, color:T.muted }}>{MOCK_RUNNERS.filter(r=>r.online).length} Buddies available in Hull</div>
        </div>
      </div>
      <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ background:T.greenBg, border:`1px solid ${T.green}33`,
          borderRadius:12, padding:'10px 14px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.green }}>✅ Job submitted! Now pick your Buddy.</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>📋 {taskText} · 📍 {address} · £{budget}</div>
        </div>

        {MOCK_RUNNERS.filter(r=>r.online).map(r => (
          <Card key={r.id} style={{ padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <Avatar emoji={r.avatar} size={52} online={r.online} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>{r.name}</span>
                  {r.badge && <Badge color={T.accent}>{r.badge}</Badge>}
                </div>
                <div style={{ fontSize:12, color:T.muted }}>⭐ {r.rating} · {r.tasks} tasks · {r.zone}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontWeight:900, color:errand.color, fontFamily:"'Syne',sans-serif" }}>{r.eta}m</div>
                <div style={{ fontSize:10, color:T.muted }}>away</div>
              </div>
            </div>
            <Button onClick={() => startTracking(r)} fullWidth>Book — £{budget}</Button>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── Step 2: Live tracking ──
  if (step === 2) return (
    <div>
      <div style={{ ...stickyHeader, justifyContent:'space-between' }}>
        <div style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>🔴 Live Tracking</div>
        <button onClick={() => setShowChat(!showChat)}
          style={{ background:T.primaryBg, border:`1px solid ${T.primary}44`,
            color:T.primary, borderRadius:10, padding:'6px 12px',
            fontWeight:700, fontSize:12, cursor:'pointer',
            fontFamily:"'DM Sans',sans-serif" }}>
          💬 Chat
        </button>
      </div>
      <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        <Card style={{ background:`linear-gradient(135deg,${errand.color}18,${T.card})`,
          borderColor:errand.color+'44', padding:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Avatar emoji={selectedRunner?.avatar} size={56} online />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:17, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>{selectedRunner?.name}</div>
              <div style={{ fontSize:12, color:T.muted }}>⭐ {selectedRunner?.rating} · Your Buddy</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:28, fontWeight:900, color:errand.color, fontFamily:"'Syne',sans-serif" }}>
                {Math.max(0,(selectedRunner?.eta||8) - Math.floor(trackStep*1.5))}m
              </div>
              <div style={{ fontSize:10, color:T.muted }}>ETA</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <Button variant="secondary" style={{ flex:1, padding:9 }}>📞 Call</Button>
            <Button variant="secondary" style={{ flex:1, padding:9 }} onClick={()=>setShowChat(!showChat)}>💬 Message</Button>
          </div>
        </Card>

        {showChat && (
          <Card style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`,
              fontWeight:700, fontSize:14, color:T.text }}>💬 Chat with {selectedRunner?.name}</div>
            <div style={{ maxHeight:200, overflowY:'auto', padding:'10px 14px',
              display:'flex', flexDirection:'column', gap:8 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display:'flex', justifyContent:m.from==='customer'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'76%', background: m.from==='customer' ? errand.color : T.card2,
                    color: m.from==='customer' ? '#fff' : T.text,
                    borderRadius:12, padding:'8px 12px', fontSize:13 }}>
                    {m.text}
                    <div style={{ fontSize:10, opacity:0.6, marginTop:3, textAlign:'right' }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:'10px 14px', borderTop:`1px solid ${T.border}`, display:'flex', gap:8 }}>
              <Input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                placeholder="Type a message..." style={{ fontSize:13 }} />
              <button onClick={sendMessage}
                style={{ background:errand.color, border:'none', color:'#fff',
                  borderRadius:10, padding:'0 14px', fontWeight:700, cursor:'pointer', fontSize:18 }}>↑</button>
            </div>
          </Card>
        )}

        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif", color:T.text }}>Live Status</div>
          {TRACK_STEPS.map((s,i) => {
            const done   = i <= trackStep;
            const active = i === trackStep;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0',
                borderBottom: i < TRACK_STEPS.length-1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ width:40, height:40, borderRadius:'50%',
                  background: done ? errand.color+'22' : T.bg2,
                  border:`2px solid ${done ? errand.color : T.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18, flexShrink:0, transition:'all 0.4s' }}>
                  {done ? s.icon : <span style={{ color:T.muted, fontSize:14 }}>○</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:active?700:500,
                    color: done ? T.text : T.muted }}>{s.label}</div>
                  {(done||active) && <div style={{ fontSize:11,
                    color: active ? errand.color : T.green, marginTop:1 }}>
                    {active ? '● In progress...' : s.sub}
                  </div>}
                </div>
                {active && <div style={{ width:8, height:8, borderRadius:'50%',
                  background:errand.color, animation:'pulse 1.2s infinite' }} />}
              </div>
            );
          })}
        </Card>

        {trackStep >= TRACK_STEPS.length-1 && (
          <Card style={{ background:T.greenBg, borderColor:T.green+'44', textAlign:'center', padding:24 }}>
            <div style={{ fontSize:48 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:900, color:T.green, marginTop:8, fontFamily:"'Syne',sans-serif" }}>Task Complete!</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4, marginBottom:14 }}>How was {selectedRunner?.name}?</div>
            <div style={{ display:'flex', justifyContent:'center', gap:8, fontSize:32, marginBottom:16 }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} onClick={()=>setRating(s)}
                  style={{ cursor:'pointer', opacity:s<=rating?1:0.3, transition:'opacity 0.2s' }}>⭐</span>
              ))}
            </div>
            <Button onClick={onComplete} fullWidth variant="secondary">Done — Book Another Errand</Button>
          </Card>
        )}

        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:T.muted, letterSpacing:0.5 }}>PAYMENT SUMMARY</div>
          {[['Service fee',`£${budget}`],['Processing fee','£0.54'],['Total',`£${(parseFloat(budget)+0.54).toFixed(2)}`]].map(([k,v],i) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between',
              fontSize:i===2?15:13, fontWeight:i===2?800:400,
              padding:'5px 0', borderTop:i===2?`1px solid ${T.border}`:'none',
              marginTop:i===2?6:0 }}>
              <span style={{ color:T.muted }}>{k}</span>
              <span style={{ color:i===2?errand.color:T.text }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  return null;
}

export default function CustomerApp() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [tab, setTab]                 = useState('home');
  const [bookingErrand, setBookingErrand] = useState(null);

  return (
    <div style={{ background:T.bg, minHeight:'100vh', width:'100%',
      display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>

      <div style={{ flex:1, overflowY:'auto' }}>

        {/* HOME */}
        {tab==='home' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={{ padding:'16px 16px 12px', background:T.card,
              borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100,
              backdropFilter:'blur(12px)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:900,
                    background:`linear-gradient(135deg,${T.primary},${T.primaryLight})`,
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                    backgroundClip:'text', fontFamily:"'Syne',sans-serif" }}>OnlyBuddy 🤝</div>
                  <div style={{ fontSize:11, color:T.muted }}>📍 Hull · {MOCK_RUNNERS.filter(r=>r.online).length} Buddies online</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={toggleTheme}
                    style={{ background:T.bg2, border:`1px solid ${T.border}`,
                      borderRadius:10, width:34, height:34, cursor:'pointer',
                      fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isDark?'☀️':'🌙'}
                  </button>
                  <button onClick={() => setTab('profile')}
                    style={{ background:T.primaryBg, border:`1px solid ${T.primary}33`,
                      borderRadius:10, padding:'6px 12px', color:T.primary,
                      fontWeight:700, fontSize:12, cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif" }}>
                    {currentUser?.email?.split('@')[0] || 'Profile'}
                  </button>
                </div>
              </div>
              <Input placeholder='Search "groceries", "pharmacy"...' icon="🔍" />
            </div>

            <div style={{ padding:'14px 16px 80px', display:'flex', flexDirection:'column', gap:20 }}>
              {/* Hero */}
              <div style={{ borderRadius:20, overflow:'hidden', position:'relative',
                background:`linear-gradient(135deg,${T.primary},${T.primaryDark} 60%,#4C1D95)`,
                padding:'24px 20px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.65)', letterSpacing:1.2 }}>HULL'S ERRAND APP</div>
                <div style={{ fontSize:28, fontWeight:900, color:'#fff', lineHeight:1.15,
                  marginTop:6, fontFamily:"'Syne',sans-serif" }}>
                  Send a Buddy<br/>in <span style={{ textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.5)' }}>30 minutes</span>
                </div>
                <div style={{ marginTop:8, fontSize:12, color:'rgba(255,255,255,0.8)' }}>Errands · Groceries · Prescriptions · Queues</div>
                <div style={{ marginTop:16 }}>
                  <button onClick={() => setTab('book')}
                    style={{ background:'#fff', color:T.primary, borderRadius:12, border:'none',
                      padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 12px rgba(0,0,0,0.15)' }}>
                    Book a Buddy →
                  </button>
                </div>
                <div style={{ position:'absolute', right:-8, bottom:-10, fontSize:80, opacity:0.12 }}>🤝</div>
              </div>

              {/* Errand types */}
              <div>
                <SectionTitle>What do you need?</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {ERRAND_TYPES.map(e => (
                    <Card key={e.id} onClick={() => { setBookingErrand(e); setTab('book'); }}
                      style={{ borderLeft:`4px solid ${e.color}`, padding:14 }}>
                      <div style={{ fontSize:28 }}>{e.icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text, marginTop:8, fontFamily:"'Syne',sans-serif" }}>{e.label}</div>
                      <div style={{ fontSize:11, color:T.muted, marginTop:3, lineHeight:1.4 }}>{e.desc}</div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Live activity */}
              <div>
                <SectionTitle>🔴 Live in Hull</SectionTitle>
                {MOCK_ORDERS.slice(0,4).map(o => {
                  const et = ERRAND_TYPES.find(e=>e.id===o.type);
                  return (
                    <Card key={o.id} style={{ display:'flex', alignItems:'center', gap:12, padding:14, marginBottom:8 }}>
                      <div style={{ fontSize:26 }}>{et?.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{o.title}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{o.customer} · {o.time}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <StatusBadge status={o.status} />
                        <div style={{ fontSize:13, fontWeight:700, marginTop:4, color:T.text }}>£{o.total.toFixed(2)}</div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pricing */}
              <Card style={{ background:T.primaryBg, borderColor:T.primary+'33' }}>
                <SectionTitle>💷 Transparent Pricing</SectionTitle>
                {[['Basic errand (under 30 min)','from £4.50'],['Shop & deliver','from £6 + item cost'],
                  ['Queue holding','£10/hr'],['Prescription collection','£5.00 flat'],
                  ['Free delivery','within 2 miles']].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between',
                    fontSize:13, padding:'6px 0', borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ color:T.text2 }}>{k}</span>
                    <span style={{ fontWeight:700, color:T.primary }}>{v}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* BOOK */}
        {tab==='book' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            {!bookingErrand ? (
              <div>
                <div style={{ padding:'16px 16px 12px', background:T.card,
                  borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 }}>
                  <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>New Errand</div>
                  <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Choose what you need done</div>
                </div>
                <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                  {ERRAND_TYPES.map(e => (
                    <Card key={e.id} onClick={() => setBookingErrand(e)}
                      style={{ display:'flex', alignItems:'center', gap:14,
                        borderLeft:`4px solid ${e.color}`, padding:16 }}>
                      <div style={{ fontSize:34 }}>{e.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:700, fontFamily:"'Syne',sans-serif", color:T.text }}>{e.label}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{e.ex}</div>
                      </div>
                      <span style={{ color:T.muted, fontSize:20 }}>›</span>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <BookingFlow errand={bookingErrand}
                onBack={() => setBookingErrand(null)}
                onComplete={() => { setBookingErrand(null); setTab('home'); }} />
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab==='orders' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={{ padding:'16px 16px 12px', background:T.card,
              borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 }}>
              <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>My Orders</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>All your past and live errands</div>
            </div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              {MOCK_ORDERS.map(o => {
                const et = ERRAND_TYPES.find(e=>e.id===o.type);
                return (
                  <Card key={o.id} style={{ padding:16 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                      <div style={{ fontSize:28, marginTop:2 }}>{et?.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{o.title}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Buddy: {o.runner} · {o.time}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>📍 {o.address}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:15, fontWeight:800, color:T.primary }}>£{o.total.toFixed(2)}</div>
                        <div style={{ marginTop:4 }}><StatusBadge status={o.status} /></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile' && (
          <div style={{ animation:'fadeUp 0.3s ease' }}>
            <div style={{ padding:'16px 16px 12px', background:T.card,
              borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 }}>
              <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>My Profile</div>
            </div>
            <div style={{ padding:16 }}>
              <Card style={{ textAlign:'center', padding:24, marginBottom:14 }}>
                <div style={{ fontSize:56, marginBottom:10 }}>👤</div>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", color:T.text }}>
                  {currentUser?.email?.split('@')[0] || 'Guest'}
                </div>
                <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>{currentUser?.email}</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Hull, HU5</div>
              </Card>
              <Card>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:12, fontFamily:"'Syne',sans-serif", color:T.text }}>Account Settings</div>
                {['Notification preferences','Payment methods','Saved addresses','Help & support','About OnlyBuddy'].map(item => (
                  <div key={item} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'12px 0', borderBottom:`1px solid ${T.border}`,
                    fontSize:14, color:T.text2, cursor:'pointer' }}>
                    <span>{item}</span><span style={{ color:T.muted }}>›</span>
                  </div>
                ))}
              </Card>
              <div style={{ textAlign:'center', marginTop:16 }}>
                <button onClick={toggleTheme}
                  style={{ background:T.card2, border:`1px solid ${T.border}`,
                    borderRadius:12, padding:'10px 20px', color:T.text2,
                    fontSize:13, fontWeight:600, cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif" }}>
                  {isDark?'☀️ Light Mode':'🌙 Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{ position:'sticky', bottom:0, width:'100%',
        background:T.navBg, borderTop:`1px solid ${T.border}`,
        display:'flex', backdropFilter:'blur(12px)', zIndex:200 }}>
        {[{id:'home',icon:'🏠',label:'Home'},{id:'book',icon:'⚡',label:'Book'},
          {id:'orders',icon:'📋',label:'Orders'},{id:'profile',icon:'👤',label:'Profile'}].map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); if(t.id!=='book') setBookingErrand(null); }}
            style={{ flex:1, padding:'10px 4px 12px', background:'none', border:'none',
              color: tab===t.id ? T.primary : T.muted,
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              position:'relative', borderTop: tab===t.id ? `2px solid ${T.primary}` : '2px solid transparent' }}>
            <span style={{ fontSize:22 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight: tab===t.id ? 700 : 500 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button, Input, Avatar, StatusBadge, SectionTitle, Spinner } from '../components/UI';
import { showToast } from '../components/Toast';
import { sendBookingConfirmation } from '../emailService';
import { MapView } from '../components/MapView';
import { StripePayment } from '../components/StripePayment';
import { ERRAND_TYPES, MOCK_ORDERS, MOCK_RUNNERS, TRACK_STEPS, CHAT_MESSAGES } from '../data';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function BookingFlow({ errand, onComplete, onBack }) {
  const { theme: T } = useTheme();
  const { currentUser } = useAuth();
  const [step, setStep]           = useState(0);
  const [taskText, setTaskText]   = useState('');
  const [address, setAddress]     = useState('');
  const [budget, setBudget]       = useState('8');
  const [selectedRunner, setSelectedRunner] = useState(null);
  const [trackStep, setTrackStep] = useState(0);
  const [chatMsg, setChatMsg]     = useState('');
  const [messages, setMessages]   = useState(CHAT_MESSAGES);
  const [rating, setRating]       = useState(0);
  const [showChat, setShowChat]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [jobId, setJobId]         = useState('');

  const submitJob = async () => {
    setFormError('');
    if (!taskText.trim()) return setFormError('Please describe your errand.');
    if (!address.trim())  return setFormError('Please enter your delivery address.');
    setSubmitting(true);
    try {
      const ref = await addDoc(collection(db, 'jobs'), {
        type:            errand.id,
        task:            taskText.trim(),
        deliveryAddress: address.trim(),
        pay:             budget,
        status:          'searching',
        customerEmail:   currentUser?.email || 'guest',
        customerId:      currentUser?.uid   || 'guest',
        createdAt:       serverTimestamp(),
      });
      setJobId(ref.id);

      // ── Send confirmation email ──
      const emailResult = await sendBookingConfirmation({
        customerEmail: currentUser?.email,
        customerName:  currentUser?.email?.split('@')[0],
        task:          taskText.trim(),
        address:       address.trim(),
        pay:           budget,
        errandType:    errand.label,
        jobId:         ref.id,
      });

      if (emailResult.success) {
        showToast('Booking confirmed! Check your email 📧', 'email');
      } else {
        showToast('Job submitted! Finding your Buddy...', 'success');
      }

      setStep(1);
    } catch (e) {
      console.error(e);
      setFormError('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  const startTracking = (runner) => {
    setSelectedRunner(runner);
    setStep(15); // payment step
  };

  const afterPayment = () => {
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
      id: Date.now(), from: 'customer', text: chatMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatMsg('');
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now() + 1, from: 'runner', text: "Got it! I'll take care of that 👍",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  const stickyHdr = {
    padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
    display: 'flex', alignItems: 'center', gap: 12,
    background: T.card, position: 'sticky', top: 0, zIndex: 10,
    backdropFilter: 'blur(12px)',
  };

  // ── Step 0: Fill details ──
  if (step === 0) return (
    <div style={{ animation: 'fadeUp 0.3s ease both' }}>
      <div style={stickyHdr}>
        <button onClick={onBack} style={{
          background: T.bg2, border: 'none', color: T.text,
          width: 36, height: 36, borderRadius: 12, cursor: 'pointer',
          fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>←</button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>
            {errand.icon} {errand.label}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>Describe your task</div>
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }} className="ob-stagger">
        <div style={{
          background: errand.color + '15', border: `1.5px solid ${errand.color}30`,
          borderRadius: 14, padding: '12px 16px',
          borderLeft: `4px solid ${errand.color}`,
        }}>
          <div style={{ fontSize: 12, color: errand.color, fontWeight: 600 }}>
            💡 Example: {errand.ex}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 8, letterSpacing: 0.8 }}>
            DESCRIBE YOUR ERRAND *
          </div>
          <Input value={taskText} onChange={e => setTaskText(e.target.value)}
            placeholder={errand.ex.replace('e.g. ', '')} multiline rows={3} />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 8, letterSpacing: 0.8 }}>
            📍 DELIVERY ADDRESS *
          </div>
          <Input value={address} onChange={e => setAddress(e.target.value)}
            placeholder="e.g. 14 Newland Ave, Hull HU5 2RQ" icon="📍" />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 10, letterSpacing: 0.8 }}>
            💷 SERVICE FEE
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['5', '8', '10', '15', '20'].map(v => (
              <button key={v} onClick={() => setBudget(v)} style={{
                padding: '9px 18px', borderRadius: 12,
                border: `2px solid ${budget === v ? errand.color : T.border}`,
                background: budget === v ? errand.color + '20' : T.card2,
                color: budget === v ? errand.color : T.muted,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif", transition: 'all 0.18s',
                transform: budget === v ? 'scale(1.05)' : 'scale(1)',
              }}>£{v}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
            ✓ You only pay after the task is completed
          </div>
        </div>

        <div style={{
          background: T.primaryBg, border: `1px solid ${T.primary}25`,
          borderRadius: 14, padding: '14px 16px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          {[['⏱', 'Arrives in 30 min'], ['💳', 'Pay after completion'],
            ['🔒', 'Fully insured'], ['✅', 'Verified Buddies']].map(([i, t]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.text2 }}>
              <span>{i}</span><span>{t}</span>
            </div>
          ))}
        </div>

        {formError && (
          <div style={{
            background: T.redBg, border: `1.5px solid ${T.red}50`,
            borderRadius: 12, padding: '10px 16px',
            fontSize: 13, color: T.red,
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'fadeUp 0.2s ease',
          }}>⚠️ {formError}</div>
        )}

        <Button onClick={submitJob} variant="primary" fullWidth
          disabled={submitting} size="lg" style={{ borderRadius: 16 }}>
          {submitting ? '⏳ Submitting...' : `Confirm & Find Buddy →`}
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 12, color: T.muted }}>
          <span>📧</span>
          <span>Confirmation will be sent to <strong style={{ color: T.text2 }}>{currentUser?.email}</strong></span>
        </div>
      </div>
    </div>
  );

  // ── Step 1: Choose runner ──
  if (step === 1) return (
    <div style={{ animation: 'fadeUp 0.3s ease both' }}>
      <div style={stickyHdr}>
        <button onClick={() => setStep(0)} style={{
          background: T.bg2, border: 'none', color: T.text,
          width: 36, height: 36, borderRadius: 12, cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>
            Choose Your Buddy
          </div>
          <div style={{ fontSize: 11, color: T.muted }}>
            {MOCK_RUNNERS.filter(r => r.online).length} available near you
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Email confirmation banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0EA5E915, #0284C715)',
          border: '1.5px solid #0EA5E940',
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 28 }}>📧</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0284C7' }}>
              Confirmation sent!
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
              Check {currentUser?.email} for your booking details
            </div>
          </div>
        </div>

        <div style={{
          background: T.greenBg, border: `1.5px solid ${T.green}40`,
          borderRadius: 14, padding: '12px 16px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green }}>
            ✅ Job submitted! Now pick your Buddy.
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
            📋 {taskText} · 📍 {address} · £{budget}
            {jobId && <span style={{ opacity: 0.6 }}> · #{jobId.slice(0, 6).toUpperCase()}</span>}
          </div>
        </div>

        {MOCK_RUNNERS.filter(r => r.online).map(r => (
          <Card key={r.id} style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <Avatar emoji={r.avatar} size={54} online={r.online} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>
                    {r.name}
                  </span>
                  {r.badge && <Badge color={T.accent}>{r.badge}</Badge>}
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>
                  ⭐ {r.rating} · {r.tasks} tasks · {r.zone}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: errand.color, fontFamily: "'Syne',sans-serif" }}>
                  {r.eta}m
                </div>
                <div style={{ fontSize: 10, color: T.muted }}>away</div>
              </div>
            </div>
            <Button onClick={() => startTracking(r)} fullWidth style={{ borderRadius: 14 }}>
              Book — £{budget}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── Step 15: Payment ──
  if (step === 15) return (
    <div style={{ animation: 'fadeUp 0.3s ease both' }}>
      <div style={stickyHdr}>
        <button onClick={() => setStep(1)} style={{
          background: T.bg2, border: 'none', color: T.text,
          width: 36, height: 36, borderRadius: 12, cursor: 'pointer',
          fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>
            💳 Pay & Confirm
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
            Buddy: {selectedRunner?.name}
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ padding: 16, borderLeft: `4px solid ${errand.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar emoji={selectedRunner?.avatar} size={46} online />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: "'Syne',sans-serif" }}>
                {selectedRunner?.name}
              </div>
              <div style={{ fontSize: 12, color: T.muted }}>⭐ {selectedRunner?.rating} · ETA {selectedRunner?.eta} min</div>
            </div>
          </div>
          <div style={{ height: 1, background: T.border, margin: '12px 0' }} />
          <div style={{ fontSize: 12, color: T.muted }}>
            📋 {taskText}<br/>
            📍 {address}
          </div>
        </Card>

        <StripePayment
          amount={parseFloat(budget) + 0.54}
          jobId={jobId}
          customerEmail={currentUser?.email}
          onSuccess={afterPayment}
          onCancel={() => setStep(1)}
        />
      </div>
    </div>
  );

  // ── Step 2: Tracking ──
  if (step === 2) return (
    <div style={{ animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ ...stickyHdr, justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>
          🔴 Live Tracking
        </div>
        <button onClick={() => setShowChat(!showChat)} style={{
          background: T.primaryBg, border: `1px solid ${T.primary}40`,
          color: T.primary, borderRadius: 12, padding: '7px 14px',
          fontWeight: 700, fontSize: 12, cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif",
        }}>💬 Chat</button>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card style={{
          background: `linear-gradient(135deg,${errand.color}18,${T.card})`,
          borderColor: errand.color + '40', padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar emoji={selectedRunner?.avatar} size={58} online />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>
                {selectedRunner?.name}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                ⭐ {selectedRunner?.rating} · Your Buddy
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: errand.color, fontFamily: "'Syne',sans-serif" }}>
                {Math.max(0, (selectedRunner?.eta || 8) - Math.floor(trackStep * 1.5))}m
              </div>
              <div style={{ fontSize: 10, color: T.muted }}>ETA</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" style={{ flex: 1, padding: 10, borderRadius: 12 }}>📞 Call</Button>
            <Button variant="secondary" style={{ flex: 1, padding: 10, borderRadius: 12 }}
              onClick={() => setShowChat(!showChat)}>💬 Message</Button>
          </div>
        </Card>

        {/* Live map */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <MapView
            buddyLocation={{ lat: 53.7457 + (trackStep * 0.002), lng: -0.3367 - (trackStep * 0.001) }}
            customerLocation={{ lat: 53.7480, lng: -0.3290 }}
            height={220}
          />
        </Card>

        {showChat && (
          <Card style={{ padding: 0, overflow: 'hidden', animation: 'slideDown 0.25s ease' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14, color: T.text }}>
              💬 Chat with {selectedRunner?.name}
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'customer' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '76%',
                    background: m.from === 'customer' ? errand.color : T.card2,
                    color: m.from === 'customer' ? '#fff' : T.text,
                    borderRadius: m.from === 'customer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '9px 14px', fontSize: 13,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    {m.text}
                    <div style={{ fontSize: 10, opacity: 0.55, marginTop: 3, textAlign: 'right' }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
              <Input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                placeholder="Type a message..." style={{ fontSize: 13 }} />
              <button onClick={sendMessage} style={{
                background: errand.color, border: 'none', color: '#fff',
                borderRadius: 12, padding: '0 16px', fontWeight: 700, cursor: 'pointer', fontSize: 18,
                transition: 'opacity 0.2s',
              }}>↑</button>
            </div>
          </Card>
        )}

        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, fontFamily: "'Syne',sans-serif", color: T.text }}>
            Live Status
          </div>
          {TRACK_STEPS.map((s, i) => {
            const done   = i <= trackStep;
            const active = i === trackStep;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < TRACK_STEPS.length - 1 ? `1px solid ${T.border}` : 'none',
                transition: 'all 0.4s ease',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: done ? errand.color + '22' : T.bg2,
                  border: `2.5px solid ${done ? errand.color : T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0, transition: 'all 0.4s',
                  boxShadow: active ? `0 0 0 4px ${errand.color}25` : 'none',
                }}>
                  {done ? s.icon : <span style={{ color: T.muted, fontSize: 14 }}>○</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? T.text : T.muted }}>
                    {s.label}
                  </div>
                  {(done || active) && (
                    <div style={{ fontSize: 11, color: active ? errand.color : T.green, marginTop: 2 }}>
                      {active ? '● In progress...' : s.sub}
                    </div>
                  )}
                </div>
                {active && (
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: errand.color, animation: 'pulse 1.2s infinite' }} />
                )}
              </div>
            );
          })}
        </Card>

        {trackStep >= TRACK_STEPS.length - 1 && (
          <Card style={{ background: T.greenBg, borderColor: T.green + '44', textAlign: 'center', padding: 28, animation: 'bounceIn 0.5s ease' }}>
            <div style={{ fontSize: 52, animation: 'float 2s ease-in-out infinite' }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: T.green, marginTop: 10, fontFamily: "'Syne',sans-serif" }}>
              Task Complete!
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 6, marginBottom: 18 }}>
              How was {selectedRunner?.name}?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: 34, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} onClick={() => setRating(s)}
                  style={{ cursor: 'pointer', opacity: s <= rating ? 1 : 0.25, transition: 'all 0.2s', transform: s <= rating ? 'scale(1.2)' : 'scale(1)' }}>
                  ⭐
                </span>
              ))}
            </div>
            <Button onClick={onComplete} fullWidth variant="secondary" style={{ borderRadius: 14 }}>
              Done — Book Another Errand
            </Button>
          </Card>
        )}

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: T.muted, letterSpacing: 0.8 }}>
            PAYMENT SUMMARY
          </div>
          {[['Service fee', `£${budget}`], ['Processing fee', '£0.54'], ['Total', `£${(parseFloat(budget) + 0.54).toFixed(2)}`]].map(([k, v], i) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: i === 2 ? 15 : 13, fontWeight: i === 2 ? 800 : 400,
              padding: '6px 0', borderTop: i === 2 ? `1px solid ${T.border}` : 'none',
              marginTop: i === 2 ? 6 : 0,
            }}>
              <span style={{ color: T.muted }}>{k}</span>
              <span style={{ color: i === 2 ? errand.color : T.text }}>{v}</span>
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
  const [tab, setTab]               = useState('home');
  const [bookingErrand, setBookingErrand] = useState(null);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{
              padding: '16px 18px 14px', background: T.card,
              borderBottom: `1px solid ${T.border}`,
              position: 'sticky', top: 0, zIndex: 100,
              backdropFilter: 'blur(16px)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{
                    fontSize: 26, fontWeight: 900,
                    background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    fontFamily: "'Syne',sans-serif", letterSpacing: '-0.5px',
                  }}>OnlyBuddy 🤝</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
                    📍 Hull · {MOCK_RUNNERS.filter(r => r.online).length} Buddies online
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={toggleTheme} style={{
                    background: T.bg2, border: `1px solid ${T.border}`,
                    borderRadius: 12, width: 36, height: 36, cursor: 'pointer',
                    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{isDark ? '☀️' : '🌙'}</button>
                  <button onClick={() => setTab('profile')} style={{
                    background: T.primaryBg, border: `1px solid ${T.primary}30`,
                    borderRadius: 12, padding: '6px 14px', color: T.primary,
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                  }}>{currentUser?.email?.split('@')[0]}</button>
                </div>
              </div>
              <Input placeholder='Search "groceries", "pharmacy"...' icon="🔍" />
            </div>

            <div style={{ padding: '16px 18px 90px', display: 'flex', flexDirection: 'column', gap: 22 }} className="ob-stagger">
              {/* Hero */}
              <div style={{
                borderRadius: 24, overflow: 'hidden', position: 'relative',
                background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 55%, #3730A3 100%)`,
                padding: '28px 24px', minHeight: 180,
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'20\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, marginBottom: 8 }}>
                  HULL'S ERRAND APP
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1.1, fontFamily: "'Syne',sans-serif", marginBottom: 10 }}>
                  Send a Buddy<br/>in <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)' }}>30 minutes</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>
                  Errands · Groceries · Prescriptions · Queues
                </div>
                <button onClick={() => setTab('book')} style={{
                  background: '#fff', color: T.primary, borderRadius: 14, border: 'none',
                  padding: '11px 22px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                }}>Book a Buddy →</button>
                <div style={{ position: 'absolute', right: -5, bottom: -10, fontSize: 90, opacity: 0.1 }}>🤝</div>
              </div>

              {/* Errand types */}
              <div>
                <SectionTitle>What do you need?</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {ERRAND_TYPES.map(e => (
                    <Card key={e.id}
                      onClick={() => { setBookingErrand(e); setTab('book'); }}
                      style={{ borderLeft: `4px solid ${e.color}`, padding: 16, cursor: 'pointer' }}>
                      <div style={{ fontSize: 30 }}>{e.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginTop: 10, fontFamily: "'Syne',sans-serif" }}>
                        {e.label}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{e.desc}</div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Live */}
              <div>
                <SectionTitle>🔴 Live in Hull</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MOCK_ORDERS.slice(0, 4).map(o => {
                    const et = ERRAND_TYPES.find(e => e.id === o.type);
                    return (
                      <Card key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                        <div style={{ fontSize: 28 }}>{et?.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{o.title}</div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{o.customer} · {o.time}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <StatusBadge status={o.status} />
                          <div style={{ fontSize: 14, fontWeight: 800, marginTop: 5, color: T.text }}>
                            £{o.total.toFixed(2)}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOK ── */}
        {tab === 'book' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {!bookingErrand ? (
              <div>
                <div style={{ padding: '16px 18px 14px', background: T.card, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: T.text }}>New Errand</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Choose what you need done</div>
                </div>
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }} className="ob-stagger">
                  {ERRAND_TYPES.map(e => (
                    <Card key={e.id} onClick={() => setBookingErrand(e)}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${e.color}`, padding: 18, cursor: 'pointer' }}>
                      <div style={{ fontSize: 36 }}>{e.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text }}>{e.label}</div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{e.ex}</div>
                      </div>
                      <span style={{ color: T.muted, fontSize: 22 }}>›</span>
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

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ padding: '16px 18px', background: T.card, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: T.text }}>My Orders</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>All your past and live errands</div>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }} className="ob-stagger">
              {MOCK_ORDERS.map(o => {
                const et = ERRAND_TYPES.find(e => e.id === o.type);
                return (
                  <Card key={o.id} style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ fontSize: 30, marginTop: 2 }}>{et?.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{o.title}</div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Buddy: {o.runner} · {o.time}</div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>📍 {o.address}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: T.primary }}>£{o.total.toFixed(2)}</div>
                        <div style={{ marginTop: 5 }}><StatusBadge status={o.status} /></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ padding: '16px 18px', background: T.card, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: T.text }}>My Profile</div>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ fontSize: 58, animation: 'float 3s ease-in-out infinite' }}>👤</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: T.text, marginTop: 10 }}>
                  {currentUser?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{currentUser?.email}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Hull, HU5</div>
              </Card>
              <Card>
                {['Notification preferences', 'Payment methods', 'Saved addresses', 'Help & support', 'About OnlyBuddy'].map(item => (
                  <div key={item} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0', borderBottom: `1px solid ${T.border}`,
                    fontSize: 14, color: T.text2, cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}>
                    <span>{item}</span><span style={{ color: T.muted }}>›</span>
                  </div>
                ))}
              </Card>
              <button onClick={toggleTheme} style={{
                background: T.card2, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: '12px 20px', color: T.text2,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif", width: '100%',
              }}>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'sticky', bottom: 0, width: '100%',
        background: T.navBg, borderTop: `1px solid ${T.border}`,
        display: 'flex', backdropFilter: 'blur(16px)', zIndex: 200,
      }}>
        {[{ id: 'home', icon: '🏠', label: 'Home' }, { id: 'book', icon: '⚡', label: 'Book' },
          { id: 'orders', icon: '📋', label: 'Orders' }, { id: 'profile', icon: '👤', label: 'Profile' }].map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== 'book') setBookingErrand(null); }}
            className={`ob-nav-btn ${tab === t.id ? 'active' : ''}`}
            style={{
              color: tab === t.id ? T.primary : T.muted,
              borderTop: tab === t.id ? `2.5px solid ${T.primary}` : '2.5px solid transparent',
            }}>
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

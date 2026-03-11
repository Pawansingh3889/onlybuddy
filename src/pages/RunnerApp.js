import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, Badge, Button, Avatar, StatusBadge, SectionTitle } from '../components/UI';
import { ERRAND_TYPES, MOCK_ORDERS, CHAT_MESSAGES } from '../data';

const AVAILABLE_JOBS = [
  { id: 'J1', type: 'grocery',  title: 'Tesco Express — 5 items',          address: 'Newland Ave, HU5',      pay: 8.00,  distance: '0.4mi', urgent: true  },
  { id: 'J2', type: 'pharmacy', title: 'Collect prescription — Boots Hull', address: 'Prospect St, HU2',      pay: 5.00,  distance: '0.9mi', urgent: false },
  { id: 'J3', type: 'buy',      title: 'Pick up from Argos — ref #12345',   address: 'St Stephens, HU1',      pay: 7.50,  distance: '1.2mi', urgent: false },
  { id: 'J4', type: 'parcel',   title: 'Return parcel to Post Office',       address: 'Anlaby Rd, HU3',        pay: 4.50,  distance: '0.7mi', urgent: true  },
];

export default function RunnerApp() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState('jobs');
  const [online, setOnline] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [jobStep, setJobStep] = useState(0);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [showChat, setShowChat] = useState(false);
  const [completedJobs, setCompletedJobs] = useState([]);

  const acceptJob = (job) => {
    setActiveJob(job);
    setJobStep(0);
    setTab('active');
  };

  const nextStep = () => {
    if (jobStep < 3) { setJobStep(s => s + 1); }
    else {
      setCompletedJobs(j => [...j, { ...activeJob, completedAt: 'Just now' }]);
      setActiveJob(null);
      setJobStep(0);
      setTab('jobs');
    }
  };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { id: Date.now(), from: 'runner', text: chatMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatMsg('');
  };

  const jobSteps = ['Head to pick-up', 'Arrived — collect items', 'Heading to customer', 'Mark as delivered'];

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} *{box-sizing:border-box} ::-webkit-scrollbar{display:none}`}</style>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* JOBS TAB */}
        {tab === 'jobs' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '16px 16px 12px', background: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif" }}>OnlyBuddy 🤝</div>
                  <div style={{ fontSize: 11, color: theme.muted }}>Buddy Portal · Hull</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={toggleTheme} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isDark ? '☀️' : '🌙'}</button>
                  <button onClick={() => setOnline(o => !o)} style={{ background: online ? theme.green + '22' : theme.bg2, border: `1px solid ${online ? theme.green : theme.border}`, borderRadius: 20, padding: '6px 14px', color: online ? theme.green : theme.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    {online ? '● Online' : '○ Offline'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Earnings today */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[['Today', '£47.50', '💷'], ['Tasks', `${completedJobs.length + 5}`, '✅'], ['Rating', '4.97 ⭐', '🏆']].map(([l, v, i]) => (
                  <Card key={l} style={{ textAlign: 'center', padding: 14 }}>
                    <div style={{ fontSize: 22 }}>{i}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif", marginTop: 4 }}>{v}</div>
                    <div style={{ fontSize: 10, color: theme.muted }}>{l}</div>
                  </Card>
                ))}
              </div>

              {/* Active job banner */}
              {activeJob && (
                <Card onClick={() => setTab('active')} style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.card})`, borderColor: theme.primary + '44', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 30 }}>{ERRAND_TYPES.find(e => e.id === activeJob.type)?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>🔴 Active Job: {activeJob.title}</div>
                      <div style={{ fontSize: 11, color: theme.muted }}>Tap to continue → Step {jobStep + 1}/4</div>
                    </div>
                    <Badge color={theme.primary}>LIVE</Badge>
                  </div>
                </Card>
              )}

              {/* Available Jobs */}
              <div>
                <SectionTitle>{online ? '⚡ Available Jobs Nearby' : '💤 Go Online to See Jobs'}</SectionTitle>
                {!online ? (
                  <Card style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 48 }}>😴</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>You're offline</div>
                    <div style={{ fontSize: 13, color: theme.muted, marginTop: 4, marginBottom: 16 }}>Go online to start receiving job requests</div>
                    <Button onClick={() => setOnline(true)}>Go Online</Button>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {AVAILABLE_JOBS.map(job => {
                      const et = ERRAND_TYPES.find(e => e.id === job.type);
                      return (
                        <Card key={job.id} style={{ padding: 16, borderLeft: `4px solid ${et?.color}` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <div style={{ fontSize: 30 }}>{et?.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{job.title}</span>
                                {job.urgent && <Badge color={theme.red}>URGENT</Badge>}
                              </div>
                              <div style={{ fontSize: 12, color: theme.muted }}>📍 {job.address} · {job.distance}</div>
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: theme.green, fontFamily: "'Syne', sans-serif" }}>£{job.pay.toFixed(2)}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Button onClick={() => acceptJob(job)} style={{ flex: 1, padding: '10px' }} disabled={!!activeJob}>
                              {activeJob ? 'Finish current job first' : 'Accept Job ✓'}
                            </Button>
                            <Button variant="secondary" style={{ padding: '10px 14px' }}>Skip</Button>
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

        {/* ACTIVE JOB TAB */}
        {tab === 'active' && activeJob && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '14px 16px', background: theme.card, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setTab('jobs')} style={{ background: theme.bg2, border: 'none', color: theme.text, width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 18 }}>←</button>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Active Job</div>
                  <div style={{ fontSize: 11, color: theme.green }}>● In Progress · £{activeJob.pay.toFixed(2)}</div>
                </div>
              </div>
              <button onClick={() => setShowChat(!showChat)} style={{ background: theme.primaryBg, border: `1px solid ${theme.primary}44`, color: theme.primary, borderRadius: 10, padding: '6px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>💬 Chat</button>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card style={{ background: `linear-gradient(135deg, ${ERRAND_TYPES.find(e => e.id === activeJob.type)?.color}18, ${theme.card})`, borderColor: ERRAND_TYPES.find(e => e.id === activeJob.type)?.color + '44', padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.muted, marginBottom: 6 }}>CURRENT TASK</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{activeJob.title}</div>
                <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>📍 {activeJob.address}</div>
                <div style={{ fontSize: 13, color: theme.green, marginTop: 4, fontWeight: 700 }}>💷 You earn: £{activeJob.pay.toFixed(2)}</div>
              </Card>

              {/* Chat */}
              {showChat && (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, fontWeight: 700, fontSize: 14 }}>💬 Chat with Customer</div>
                  <div style={{ maxHeight: 200, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {messages.map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'runner' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '75%', background: m.from === 'runner' ? theme.primary : theme.card2, color: m.from === 'runner' ? '#fff' : theme.text, borderRadius: 12, padding: '8px 12px', fontSize: 13 }}>
                          {m.text}
                          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: 'right' }}>{m.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8 }}>
                    <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Message customer..." style={{ flex: 1, background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '9px 12px', color: theme.text, fontSize: 13, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                    <button onClick={sendMsg} style={{ background: theme.primary, border: 'none', color: '#fff', borderRadius: 10, padding: '0 14px', fontWeight: 700, cursor: 'pointer', fontSize: 18 }}>↑</button>
                  </div>
                </Card>
              )}

              {/* Steps */}
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>Your Steps</div>
                {jobSteps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < jobSteps.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: i < jobStep ? theme.green + '22' : i === jobStep ? theme.primary + '22' : theme.bg2, border: `2px solid ${i < jobStep ? theme.green : i === jobStep ? theme.primary : theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {i < jobStep ? '✅' : i === jobStep ? '🔴' : <span style={{ color: theme.muted, fontSize: 12 }}>○</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: i === jobStep ? 700 : 400, color: i <= jobStep ? theme.text : theme.muted }}>{step}</div>
                  </div>
                ))}
              </Card>

              <Button onClick={nextStep} fullWidth size="lg">
                {jobStep < 3 ? `✓ ${jobSteps[jobStep]}` : '🎉 Mark as Delivered'}
              </Button>
            </div>
          </div>
        )}

        {/* EARNINGS TAB */}
        {tab === 'earnings' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '16px 16px 12px', background: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>My Earnings</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>THIS WEEK</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", marginTop: 4 }}>£127.50</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Next payout: Friday · via Bank Transfer</div>
              </Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['This Month', '£412.00'], ['Total Earned', '£3,847.50'], ['Avg per task', '£6.26'], ['Tasks done', '614']].map(([l, v]) => (
                  <Card key={l} style={{ padding: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: theme.primary, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                    <div style={{ fontSize: 11, color: theme.muted, marginTop: 3 }}>{l}</div>
                  </Card>
                ))}
              </div>
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>Recent Payouts</div>
                {[['This Friday', '£127.50', 'Pending'], ['Last Friday', '£98.00', 'Paid'], ['2 weeks ago', '£114.25', 'Paid']].map(([d, a, s]) => (
                  <div key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d}</div>
                      <div style={{ fontSize: 11, color: theme.muted }}>Direct bank transfer</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: theme.green }}>{a}</div>
                      <Badge color={s === 'Paid' ? theme.green : theme.accent}>{s}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '16px 16px 12px', background: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Buddy Profile</div>
            </div>
            <div style={{ padding: 16 }}>
              <Card style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, marginBottom: 14 }}>
                <Avatar emoji="🧑‍🦱" size={60} online={online} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Callum H.</div>
                  <div style={{ fontSize: 13, color: theme.muted }}>Hull HU5 · Joined Jan 2025</div>
                  <div style={{ fontSize: 13, color: theme.primary, fontWeight: 700, marginTop: 4 }}>⭐ 4.97 · 842 tasks</div>
                </div>
                <Badge color={theme.accent}>TOP BUDDY</Badge>
              </Card>
              <Card>
                {['Edit profile', 'Vehicle details', 'Bank account', 'DBS certificate', 'Help & support', 'Terms & conditions'].map(item => (
                  <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, fontSize: 14, color: theme.text2, cursor: 'pointer' }}>
                    <span>{item}</span><span style={{ color: theme.muted }}>›</span>
                  </div>
                ))}
              </Card>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={toggleTheme} style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '10px 20px', color: theme.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: 'sticky', bottom: 0, width: '100%', background: theme.navBg, borderTop: `1px solid ${theme.border}`, display: 'flex', backdropFilter: 'blur(12px)', zIndex: 200 }}>
        {[
          { id: 'jobs',     icon: '⚡', label: 'Jobs',     badge: online ? AVAILABLE_JOBS.length : 0 },
          { id: 'active',   icon: '🔴', label: 'Active',   badge: activeJob ? 1 : 0 },
          { id: 'earnings', icon: '💷', label: 'Earnings', badge: 0 },
          { id: 'profile',  icon: '👤', label: 'Profile',  badge: 0 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px 4px 12px', background: 'none', border: 'none', color: tab === t.id ? theme.primary : theme.muted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              {t.badge > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: theme.primary, color: '#fff', borderRadius: 10, fontSize: 9, fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{t.badge}</span>}
            </div>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

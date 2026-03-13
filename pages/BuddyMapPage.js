import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Hull postcode areas with approximate lat/lng centres
const HULL_AREAS = {
  HU1: { lat: 53.7441, lng: -0.3364, name: 'City Centre' },
  HU2: { lat: 53.7480, lng: -0.3489, name: 'City Centre North' },
  HU3: { lat: 53.7390, lng: -0.3650, name: 'Hessle Road' },
  HU4: { lat: 53.7330, lng: -0.3900, name: 'Boothferry' },
  HU5: { lat: 53.7550, lng: -0.3620, name: 'Newland / Beverley Road' },
  HU6: { lat: 53.7720, lng: -0.3560, name: 'Orchard Park' },
  HU7: { lat: 53.7820, lng: -0.3200, name: 'Bransholme' },
  HU8: { lat: 53.7580, lng: -0.3050, name: 'East Hull' },
  HU9: { lat: 53.7460, lng: -0.2980, name: 'Holderness Road' },
  HU10: { lat: 53.7450, lng: -0.4300, name: 'Willerby / Anlaby' },
  HU11: { lat: 53.8100, lng: -0.2700, name: 'Hedon Road' },
  HU12: { lat: 53.7200, lng: -0.2500, name: 'Withernsea area' },
  HU13: { lat: 53.7200, lng: -0.4300, name: 'Hessle' },
  HU14: { lat: 53.7300, lng: -0.4800, name: 'North Ferriby' },
  HU15: { lat: 53.7500, lng: -0.5500, name: 'South Cave' },
  HU16: { lat: 53.7900, lng: -0.4200, name: 'Cottingham' },
  HU17: { lat: 53.8400, lng: -0.4300, name: 'Beverley' },
};

// Convert lat/lng to SVG x/y within Hull bounding box
const BOUNDS = {
  minLat: 53.710, maxLat: 53.860,
  minLng: -0.580, maxLng: -0.240,
};
const W = 600, H = 420;
function toXY(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

const VEHICLE_EMOJI = { Car: '🚗', Bicycle: '🚲', Motorbike: '🏍️', Van: '🚐', 'On foot': '🚶' };

export default function BuddyMapPage() {
  const { theme } = useTheme();
  const [onlineBuddies, setOnlineBuddies] = useState([]);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [filterZone, setFilterZone] = useState('');

  // Live feed of online buddies from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'buddy'),
      where('isOnline', '==', true),
      where('status', '==', 'approved')
    );
    return onSnapshot(q, snap => {
      setOnlineBuddies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error('Buddy map error:', err.message));
  }, []);

  const filtered = filterZone
    ? onlineBuddies.filter(b => (b.preferredZones || []).includes(filterZone))
    : onlineBuddies;

  const hullZones = Object.keys(HULL_AREAS).slice(0, 9); // HU1–HU9 for filter

  return (
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Live Map</div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>
          Buddies Near You
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto' }}>
          {onlineBuddies.length > 0
            ? `${onlineBuddies.length} Buddy${onlineBuddies.length !== 1 ? 's' : ''} online right now across Hull`
            : 'Checking for online Buddies...'}
        </p>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Zone filter */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Filter by area</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setFilterZone('')} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${!filterZone ? theme.primary : theme.border}`, background: !filterZone ? theme.primaryBg : theme.card2, color: !filterZone ? theme.primary : theme.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              All Hull
            </button>
            {hullZones.map(z => (
              <button key={z} onClick={() => setFilterZone(z === filterZone ? '' : z)} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${filterZone === z ? theme.primary : theme.border}`, background: filterZone === z ? theme.primaryBg : theme.card2, color: filterZone === z ? theme.primary : theme.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Map */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 28, position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            {/* Background */}
            <rect width={W} height={H} fill={theme.card} />

            {/* Grid lines */}
            {[...Array(6)].map((_, i) => (
              <line key={`v${i}`} x1={(W / 5) * i} y1={0} x2={(W / 5) * i} y2={H} stroke={theme.border} strokeWidth={0.5} />
            ))}
            {[...Array(5)].map((_, i) => (
              <line key={`h${i}`} x1={0} y1={(H / 4) * i} x2={W} y2={(H / 4) * i} stroke={theme.border} strokeWidth={0.5} />
            ))}

            {/* River Humber suggestion at bottom */}
            <ellipse cx={W * 0.35} cy={H - 10} rx={W * 0.45} ry={22} fill="#BFDBFE" opacity={0.4} />
            <text x={W * 0.35} y={H - 5} textAnchor="middle" fontSize={10} fill="#60A5FA" fontFamily="Inter,sans-serif">River Humber</text>

            {/* Area labels */}
            {Object.entries(HULL_AREAS).map(([code, area]) => {
              const { x, y } = toXY(area.lat, area.lng);
              if (x < 0 || x > W || y < 0 || y > H) return null;
              const hasBuddy = filtered.some(b => (b.preferredZones || []).includes(code));
              return (
                <g key={code}>
                  <circle cx={x} cy={y} r={hasBuddy ? 14 : 8} fill={hasBuddy ? `${theme.primary}22` : `${theme.border}66`} stroke={hasBuddy ? theme.primary : theme.border} strokeWidth={hasBuddy ? 2 : 1} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize={9} fontWeight="700" fill={hasBuddy ? theme.primary : theme.muted} fontFamily="Inter,sans-serif">{code}</text>
                </g>
              );
            })}

            {/* Buddy dots — one per unique zone they cover */}
            {filtered.map((buddy, i) => {
              const zones = buddy.preferredZones || [];
              // Show in their first zone
              const zone = filterZone && zones.includes(filterZone) ? filterZone : zones[0];
              if (!zone || !HULL_AREAS[zone]) return null;
              const { x, y } = toXY(HULL_AREAS[zone].lat, HULL_AREAS[zone].lng);
              const offset = (i % 4) * 10 - 15;
              return (
                <g key={buddy.id} onClick={() => setSelectedBuddy(selectedBuddy?.id === buddy.id ? null : buddy)} style={{ cursor: 'pointer' }}>
                  <circle cx={x + offset} cy={y - 22} r={16} fill={selectedBuddy?.id === buddy.id ? theme.primary : '#10B981'} stroke="#fff" strokeWidth={2.5} />
                  <text x={x + offset} y={y - 18} textAnchor="middle" fontSize={14}>{VEHICLE_EMOJI[buddy.vehicleType] || '🚶'}</text>
                  {/* Online pulse ring */}
                  <circle cx={x + offset} cy={y - 22} r={20} fill="none" stroke="#10B981" strokeWidth={1} opacity={0.4} />
                </g>
              );
            })}
          </svg>

          {/* Map legend */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '8px 12px', fontSize: 11, color: theme.muted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              Online Buddy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${theme.primary}`, background: `${theme.primary}22` }} />
              Area with Buddy
            </div>
          </div>
        </div>

        {/* Selected buddy card */}
        {selectedBuddy && (
          <div style={{ background: theme.card, border: `2px solid ${theme.primary}`, borderRadius: 18, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {VEHICLE_EMOJI[selectedBuddy.vehicleType] || '🚶'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Outfit',sans-serif", color: theme.text }}>{selectedBuddy.fullName || 'Buddy'}</div>
              <div style={{ fontSize: 13, color: theme.muted, marginTop: 2 }}>
                {selectedBuddy.vehicleType} · Covers {(selectedBuddy.preferredZones || []).join(', ') || 'All Hull'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>Online now</span>
              </div>
            </div>
            <Link to="/book" style={{ textDecoration: 'none', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', padding: '11px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
              Book Now →
            </Link>
          </div>
        )}

        {/* Buddy list */}
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          {filtered.length > 0 ? `${filtered.length} Buddy${filtered.length !== 1 ? 's' : ''} Available` : 'No Buddies Online Right Now'}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😴</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>No Buddies Online</div>
            <div style={{ fontSize: 14, color: theme.muted, marginBottom: 24, lineHeight: 1.7 }}>
              All Buddies are currently offline. Orders placed now will be picked up when a Buddy comes online — usually within minutes.
            </div>
            <Link to="/book" style={{ textDecoration: 'none', display: 'inline-block', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', padding: '13px 28px', borderRadius: 14, fontWeight: 700, fontSize: 15 }}>
              Place Order Anyway →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(buddy => (
              <div key={buddy.id} onClick={() => setSelectedBuddy(selectedBuddy?.id === buddy.id ? null : buddy)} style={{ background: theme.card, border: `1.5px solid ${selectedBuddy?.id === buddy.id ? theme.primary : theme.border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, #10B98122, #10B98144)`, border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {VEHICLE_EMOJI[buddy.vehicleType] || '🚶'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{buddy.fullName || 'Buddy'}</div>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                    {buddy.vehicleType} · {(buddy.preferredZones || []).slice(0, 4).join(', ') || 'All Hull'}
                    {(buddy.preferredZones || []).length > 4 && ` +${buddy.preferredZones.length - 4} more`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>Online</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
                    {buddy.completedJobs || 0} jobs done
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ background: `linear-gradient(135deg, ${theme.primary}11, ${theme.primaryDark}22)`, border: `1px solid ${theme.primary}33`, borderRadius: 18, padding: '28px 24px', textAlign: 'center', marginTop: 32 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>Ready to Book?</div>
          <div style={{ fontSize: 14, color: theme.muted, marginBottom: 20 }}>Matched with a local Buddy in minutes. Pay only when done.</div>
          <Link to="/book" style={{ textDecoration: 'none', display: 'inline-block', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', padding: '14px 36px', borderRadius: 14, fontWeight: 800, fontSize: 16 }}>
            Book a Buddy Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps);
    if (!MAPS_KEY || MAPS_KEY === 'YOUR_KEY') return reject(new Error('NO_KEY'));
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry`;
    s.onload  = () => resolve(window.google.maps);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Hull centre coordinates
const HULL = { lat: 53.7457, lng: -0.3367 };

export function MapView({ buddyLocation, customerLocation, showRoute = true, height = 280 }) {
  const { theme: T, isDark } = useTheme();
  const mapRef  = useRef(null);
  const mapObj  = useRef(null);
  const markers = useRef([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoogleMaps().then(maps => {
      setLoading(false);
      if (!mapRef.current) return;

      mapObj.current = new maps.Map(mapRef.current, {
        center: buddyLocation || HULL,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        styles: isDark ? DARK_STYLE : [],
        gestureHandling: 'cooperative',
      });

      // Buddy marker
      if (buddyLocation) {
        markers.current.push(new maps.Marker({
          position: buddyLocation,
          map: mapObj.current,
          title: 'Your Buddy',
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#6D28D9" stroke="white" stroke-width="3"/>
                <text x="20" y="26" text-anchor="middle" font-size="16">🏃</text>
              </svg>`),
            scaledSize: new maps.Size(40, 40),
          },
        }));
      }

      // Customer marker
      if (customerLocation) {
        markers.current.push(new maps.Marker({
          position: customerLocation,
          map: mapObj.current,
          title: 'Delivery address',
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#059669" stroke="white" stroke-width="3"/>
                <text x="20" y="26" text-anchor="middle" font-size="16">📍</text>
              </svg>`),
            scaledSize: new maps.Size(40, 40),
          },
        }));
      }

      // Draw route
      if (showRoute && buddyLocation && customerLocation) {
        const ds = new maps.DirectionsService();
        const dr = new maps.DirectionsRenderer({
          map: mapObj.current,
          suppressMarkers: true,
          polylineOptions: { strokeColor: '#6D28D9', strokeWeight: 4, strokeOpacity: 0.8 },
        });
        ds.route({
          origin: buddyLocation,
          destination: customerLocation,
          travelMode: maps.TravelMode.WALKING,
        }, (result, status) => {
          if (status === 'OK') dr.setDirections(result);
        });
      }
    }).catch(e => {
      setLoading(false);
      setError(e.message === 'NO_KEY' ? 'no_key' : 'failed');
    });
  }, [buddyLocation, customerLocation, isDark, showRoute]);

  if (loading) return (
    <div style={{
      height, borderRadius: 16, background: T.bg2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.muted, fontSize: 13,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
        Loading map...
      </div>
    </div>
  );

  if (error === 'no_key') return (
    <div style={{
      height, borderRadius: 16,
      background: `linear-gradient(135deg, #1e1b4b, #312e81)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 10, padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fake map grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.1,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div style={{ fontSize: 36 }}>🗺️</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', textAlign: 'center', fontFamily: "'Syne',sans-serif" }}>
        Maps ready to activate
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.6 }}>
        Add <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>REACT_APP_GOOGLE_MAPS_KEY</code><br/>
        to Vercel environment variables
      </div>
    </div>
  );

  return (
    <div ref={mapRef} style={{
      height, borderRadius: 16, overflow: 'hidden',
      border: `1px solid ${T.border}`,
    }} />
  );
}

const DARK_STYLE = [
  { elementType: 'geometry',         stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'road',             elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road',             elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water',            elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi',              stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',          stylers: [{ visibility: 'off' }] },
];

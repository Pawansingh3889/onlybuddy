import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { searchProducts, getByCategory, getProductImageUrl, CATEGORIES } from '../data/groceryProducts';

const ERRAND_TYPES = [
  { id:'grocery',  icon:'🛒', label:'Grocery Run',      color:'#059669', pricing:'15% of basket (min £4.99)', type:'grocery' },
  { id:'buy',      icon:'🛍️', label:'Buy & Deliver',    color:'#7C3AED', pricing:'£6.99 / £9.99 by distance', type:'distance' },
  { id:'queue',    icon:'⏳', label:'Queue for Me',      color:'#D97706', pricing:'£8.00/hr · min 30 min',     type:'hourly' },
  { id:'parcel',   icon:'📦', label:'Parcel & Returns', color:'#2563EB', pricing:'£6.99 / £9.99 by distance', type:'distance' },
  { id:'pharmacy', icon:'💊', label:'Prescription Run', color:'#DB2777', pricing:'£6.99 flat — all of Hull',  type:'flat', fee:6.99 },
];

const HULL_STORES = [
  { id:'morrisons',  icon:'🟡', name:'Morrisons' },
  { id:'tesco',      icon:'🔵', name:'Tesco' },
  { id:'asda',       icon:'🟢', name:'Asda' },
  { id:'sainsburys', icon:'🟠', name:"Sainsbury's" },
  { id:'aldi',       icon:'🔴', name:'Aldi' },
  { id:'lidl',       icon:'🟤', name:'Lidl' },
  { id:'coop',       icon:'⚫', name:'Co-op' },
  { id:'other',      icon:'🏪', name:'Other' },
];

const calcGroceryFee = (total) => Math.max(total * 0.15, 4.99);
const calcDistanceFee = (over2) => over2 ? 9.99 : 6.99;
const calcQueueFee = (mins) => Math.ceil(Math.max(mins, 30) / 30) * 4.00;

// ProductImage with graceful fallback
function ProductImage({ product, size = 44 }) {
  const [src, setSrc] = useState(getProductImageUrl(product.barcode));
  const [loaded, setLoaded] = useState(false);
  if (!src) return <div style={{ fontSize: size * 0.6, lineHeight: 1 }}>{product.emoji}</div>;
  return (
    <div style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      {!loaded && <span style={{ fontSize: size * 0.5, position: 'absolute' }}>{product.emoji}</span>}
      <img
        src={src}
        alt={product.name}
        onLoad={() => setLoaded(true)}
        onError={() => { setSrc(null); }}
        style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: loaded ? 1 : 0, transition: 'opacity 0.2s' }}
      />
    </div>
  );
}

export default function BookingPage() {
  const { theme, isDark } = useTheme();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(0);
  const [errand, setErrand] = useState(null);
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  // Grocery
  const [store, setStore] = useState('');
  const [items, setItems] = useState([]);
  const [basketEstimate, setBasketEstimate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [browseProducts, setBrowseProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const nextId = useRef(1);

  // Other forms
  const [distanceMiles, setDistanceMiles] = useState('under2');
  const [queueMins, setQueueMins] = useState(30);
  const [queueLocation, setQueueLocation] = useState('');
  const [buyDescription, setBuyDescription] = useState('');
  const [buyShop, setBuyShop] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [parcelCarrier, setParcelCarrier] = useState('');
  const [parcelType, setParcelType] = useState('return');
  const [pharmacyName, setPharmacyName] = useState('');
  const [scriptType, setScriptType] = useState('nhs');

  // Live search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults(searchProducts(searchQuery, 8));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Browse by category
  useEffect(() => {
    if (activeCategory) {
      setBrowseProducts(getByCategory(activeCategory, 16));
    }
  }, [activeCategory]);

  const addProduct = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: nextId.current++, productId: product.id, name: product.name, brand: product.brand, emoji: product.emoji, barcode: product.barcode, price: product.price, unit: product.unit, qty: 1 }];
    });
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const calcFee = () => {
    if (!errand) return 0;
    if (errand.type === 'grocery') return calcGroceryFee(parseFloat(basketEstimate) || 0);
    if (errand.type === 'distance') return calcDistanceFee(distanceMiles === 'over2');
    if (errand.type === 'hourly') return calcQueueFee(queueMins);
    if (errand.type === 'flat') return errand.fee;
    return 0;
  };

  const basketTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

  useEffect(() => {
    if (basketTotal > 0) setBasketEstimate(basketTotal.toFixed(2));
  }, [basketTotal]);

  const validateStep1 = () => {
    if (!address.trim())  { setError('Please enter your delivery address'); return false; }
    if (!postcode.trim()) { setError('Please enter your postcode'); return false; }
    if (errand?.type === 'grocery' && !store) { setError('Please select a store'); return false; }
    if (errand?.type === 'grocery' && items.length === 0) { setError('Please add at least one item to your list'); return false; }
    if (errand?.type === 'hourly' && !queueLocation.trim()) { setError('Please enter the queue location'); return false; }
    if (errand?.id === 'buy' && !buyDescription.trim()) { setError('Please describe what you need'); return false; }
    setError(''); return true;
  };

  const submitOrder = async () => {
    setSubmitting(true); setError('');
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        errandType: errand.label, errandId: errand.id,
        address, postcode: postcode.toUpperCase(), notes,
        serviceFee: calcFee(),
        ...(errand.type === 'grocery' ? { store, items, basketEstimate: parseFloat(basketEstimate) || basketTotal } : {}),
        ...(errand.type === 'hourly' ? { queueLocation, estimatedMinutes: queueMins } : {}),
        ...(errand.id === 'buy' ? { buyDescription, buyShop, buyPrice: parseFloat(buyPrice) || null } : {}),
        ...(errand.id === 'parcel' ? { parcelCarrier, parcelType } : {}),
        ...(errand.id === 'pharmacy' ? { pharmacyName, scriptType } : {}),
        distanceBand: errand.type === 'distance' ? distanceMiles : null,
        paymentMethod: payment, status: 'pending',
        customerId: currentUser?.uid || 'guest',
        customerEmail: currentUser?.email || '',
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id); setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  };

  const inp = { width:'100%', background:theme.card2, border:`1.5px solid ${theme.border}`, borderRadius:12, padding:'12px 15px', color:theme.text, fontSize:14, fontFamily:"'Inter',sans-serif", outline:'none' };
  const fee = calcFee();

  // ── SUBMITTED ─────────────────────────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:theme.bg }}>
      <div style={{ maxWidth:520, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontSize:28, fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text, marginBottom:12 }}>Order Confirmed!</h1>
        <p style={{ fontSize:15, color:theme.muted, lineHeight:1.8, marginBottom:28 }}>We're matching you with a nearby Buddy. You'll get a text when they accept.</p>
        <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:18, padding:'24px 28px', textAlign:'left', marginBottom:24 }}>
          {errand.type === 'grocery' && items.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:theme.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Shopping List for {HULL_STORES.find(s=>s.id===store)?.name}</div>
              {items.map(i => (
                <div key={i.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <ProductImage product={i} size={32} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:theme.text }}>{i.qty}× {i.name}</div>
                    <div style={{ fontSize:11, color:theme.muted }}>{i.brand} · {i.unit} · £{(i.price * i.qty).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop:`1px solid ${theme.border}`, paddingTop:12, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, color:theme.muted }}>Service Fee</span>
            <span style={{ fontSize:22, fontWeight:900, color:theme.primary, fontFamily:"'Outfit',sans-serif" }}>£{fee.toFixed(2)}</span>
          </div>
          <div style={{ fontSize:12, color:theme.green||'#059669', marginTop:6 }}>✓ Only charged after completion</div>
        </div>
        <div style={{ fontSize:13, color:theme.muted, marginBottom:24 }}>Order ref: <span style={{ fontFamily:'monospace', color:theme.text2 }}>{orderId.slice(0,8).toUpperCase()}</span></div>
        <Link to="/" style={{ textDecoration:'none', display:'inline-block', background:'linear-gradient(135deg, #6366F1, #4338CA)', color:'#fff', padding:'13px 32px', borderRadius:14, fontSize:15, fontWeight:700 }}>Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div style={{ background:theme.bg, minHeight:'100vh', overflowX:'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .b-inp:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}22; outline: none; }
        .prod-row:hover { background: ${theme.bg2} !important; }
        .cat-chip:hover { border-color: ${theme.primary} !important; color: ${theme.primary} !important; }
        .item-card { transition: all 0.15s; }
        .item-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        @media(max-width:500px){ .store-grid{ grid-template-columns: repeat(4,1fr) !important; } }
      `}</style>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'clamp(24px,4vw,52px) 20px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:'clamp(22px,5vw,34px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text, marginBottom:6 }}>Book a Buddy</h1>
          <p style={{ fontSize:14, color:theme.muted }}>Matched with a local Hull Buddy in minutes. Pay only when done.</p>
        </div>

        {/* Steps */}
        <div style={{ display:'flex', gap:8, marginBottom:32, alignItems:'center' }}>
          {['Pick Errand','Details','Confirm'].map((label,i) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8, flex:i<2?1:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:step>=i?theme.primary:theme.card2, border:`2px solid ${step>=i?theme.primary:theme.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:step>=i?'#fff':theme.muted, flexShrink:0 }}>{step>i?'✓':i+1}</div>
                <span style={{ fontSize:13, fontWeight:step===i?700:500, color:step===i?theme.text:theme.muted, whiteSpace:'nowrap' }}>{label}</span>
              </div>
              {i<2&&<div style={{ flex:1, height:2, background:step>i?theme.primary:theme.border, borderRadius:1 }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Pick errand ── */}
        {step===0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>What do you need?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {ERRAND_TYPES.map(e => (
                <button key={e.id} onClick={()=>{setErrand(e);setStep(1);setError('');}} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:theme.card, border:`1.5px solid ${theme.border}`, borderRadius:16, cursor:'pointer', textAlign:'left', fontFamily:"'Inter',sans-serif", borderLeft:`4px solid ${e.color}`, transition:'all 0.15s' }}>
                  <span style={{ fontSize:30, flexShrink:0 }}>{e.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:theme.text, fontFamily:"'Outfit',sans-serif" }}>{e.label}</div>
                    <div style={{ fontSize:12, color:theme.muted, marginTop:2 }}>{e.pricing}</div>
                  </div>
                  <span style={{ fontSize:18, color:theme.muted }}>→</span>
                </button>
              ))}
            </div>
            {!currentUser && (
              <div style={{ background:theme.primaryBg, border:`1px solid ${theme.primary}33`, borderRadius:12, padding:'12px 16px', fontSize:13, color:theme.muted }}>
                💡 <Link to="/login" style={{ color:theme.primary, fontWeight:700 }}>Sign in</Link> to track orders and re-order in one tap.
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {step===1 && errand && (
          <div>
            <button onClick={()=>{setStep(0);setError('');}} style={{ background:'none', border:'none', color:theme.muted, fontSize:13, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', gap:6, fontFamily:"'Inter',sans-serif" }}>← Back</button>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'14px 18px', background:theme.card, border:`1.5px solid ${errand.color}33`, borderRadius:14, borderLeft:`4px solid ${errand.color}` }}>
              <span style={{ fontSize:26 }}>{errand.icon}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:theme.text, fontFamily:"'Outfit',sans-serif" }}>{errand.label}</div>
                <div style={{ fontSize:12, color:theme.muted }}>{errand.pricing}</div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

              {/* ── GROCERY FORM ── */}
              {errand.type==='grocery' && (
                <div>
                  {/* Store picker */}
                  <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:8, textTransform:'uppercase' }}>Which Store? *</label>
                  <div className="store-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:22 }}>
                    {HULL_STORES.map(s => (
                      <button key={s.id} onClick={()=>setStore(s.id)} style={{ padding:'10px 4px', borderRadius:12, border:`1.5px solid ${store===s.id?'#059669':theme.border}`, background:store===s.id?'#05966918':theme.card2, color:store===s.id?'#059669':theme.muted, fontSize:11, fontWeight:700, cursor:'pointer', textAlign:'center', transition:'all 0.15s', fontFamily:"'Inter',sans-serif" }}>
                        <div style={{ fontSize:20, marginBottom:2 }}>{s.icon}</div>{s.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Product search */}
                  <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:8, textTransform:'uppercase' }}>Build Your Shopping List *</label>

                  {/* Search box */}
                  <div style={{ position:'relative', marginBottom:12 }} ref={searchRef}>
                    <div style={{ display:'flex', gap:8 }}>
                      <div style={{ flex:1, position:'relative' }}>
                        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
                        <input
                          className="b-inp"
                          style={{ ...inp, paddingLeft:38 }}
                          placeholder="Search products... e.g. milk, bread, Heinz"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onFocus={() => setShowSearch(true)}
                          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                        />
                      </div>
                    </div>

                    {/* Search results dropdown */}
                    {showSearch && searchResults.length > 0 && (
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:theme.card, border:`1.5px solid ${theme.primary}44`, borderRadius:14, zIndex:100, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.15)' }}>
                        {searchResults.map(p => (
                          <div key={p.id} className="prod-row" onMouseDown={()=>addProduct(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer', borderBottom:`1px solid ${theme.border}`, transition:'background 0.1s' }}>
                            <ProductImage product={p} size={40} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:14, fontWeight:600, color:theme.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize:11, color:theme.muted }}>{p.brand} · {p.unit}</div>
                            </div>
                            <div style={{ fontSize:14, fontWeight:700, color:'#059669', flexShrink:0 }}>~£{p.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No results — open OFF fallback */}
                    {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:theme.card, border:`1.5px solid ${theme.border}`, borderRadius:14, zIndex:100, padding:'14px 16px', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize:13, color:theme.muted }}>No match in database. Try a different spelling or add it manually below.</div>
                      </div>
                    )}
                  </div>

                  {/* Category browse */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:theme.muted, fontWeight:600, marginBottom:8 }}>Browse by category:</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat.id} className="cat-chip" onClick={()=>setActiveCategory(activeCategory===cat.id?null:cat.id)} style={{ padding:'6px 12px', borderRadius:20, border:`1.5px solid ${activeCategory===cat.id?theme.primary:theme.border}`, background:activeCategory===cat.id?theme.primaryBg:theme.card2, color:activeCategory===cat.id?theme.primary:theme.muted, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', whiteSpace:'nowrap' }}>
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category products */}
                  {activeCategory && browseProducts.length > 0 && (
                    <div style={{ background:theme.card2, borderRadius:14, padding:14, marginBottom:14 }}>
                      <div style={{ fontSize:11, color:theme.muted, fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>
                        {CATEGORIES.find(c=>c.id===activeCategory)?.emoji} {CATEGORIES.find(c=>c.id===activeCategory)?.label}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:8 }}>
                        {browseProducts.map(p => (
                          <div key={p.id} className="item-card" onClick={()=>addProduct(p)} style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:12, padding:'10px 10px', cursor:'pointer', display:'flex', gap:8, alignItems:'center' }}>
                            <ProductImage product={p} size={36} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:600, color:theme.text, lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.name}</div>
                              <div style={{ fontSize:11, color:'#059669', fontWeight:700, marginTop:2 }}>~£{p.price.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current list */}
                  {items.length > 0 && (
                    <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:14, overflow:'hidden', marginBottom:14 }}>
                      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:13, fontWeight:700, color:theme.text }}>🛒 Your List ({items.length} items)</div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#059669' }}>~£{basketTotal.toFixed(2)}</div>
                      </div>
                      {items.map(item => (
                        <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:`1px solid ${theme.border}` }}>
                          <ProductImage product={item} size={38} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:theme.text }}>{item.name}</div>
                            <div style={{ fontSize:11, color:theme.muted }}>{item.brand} · {item.unit} · ~£{item.price.toFixed(2)} each</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                            <button onClick={()=>updateQty(item.id,-1)} style={{ width:26, height:26, borderRadius:8, border:`1px solid ${theme.border}`, background:theme.card2, color:theme.text, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>−</button>
                            <span style={{ minWidth:18, textAlign:'center', fontSize:14, fontWeight:700, color:theme.text }}>{item.qty}</span>
                            <button onClick={()=>updateQty(item.id,1)} style={{ width:26, height:26, borderRadius:8, border:`1px solid ${theme.border}`, background:theme.card2, color:theme.text, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>+</button>
                            <button onClick={()=>removeItem(item.id)} style={{ width:26, height:26, borderRadius:8, border:'1px solid #EF444433', background:'#FEE2E2', color:'#EF4444', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:4 }}>×</button>
                          </div>
                        </div>
                      ))}
                      {/* Fee preview */}
                      <div style={{ padding:'12px 16px', background:isDark?theme.bg2:'#F0FDF4', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontSize:11, color:theme.muted, fontWeight:600 }}>Estimated basket</div>
                          <div style={{ fontSize:13, color:theme.muted }}>Service fee (15%, min £4.99)</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:13, fontWeight:700, color:theme.text }}>~£{basketTotal.toFixed(2)}</div>
                          <div style={{ fontSize:16, fontWeight:900, color:'#059669', fontFamily:"'Outfit',sans-serif" }}>£{calcGroceryFee(basketTotal).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual add for unlisted items */}
                  <details style={{ marginBottom:8 }}>
                    <summary style={{ fontSize:12, color:theme.muted, cursor:'pointer', fontWeight:600 }}>+ Add unlisted item manually</summary>
                    <div style={{ marginTop:10, display:'flex', gap:8 }}>
                      <input className="b-inp" style={{ ...inp, flex:1 }} placeholder="e.g. Gluten-free pasta" id="manual-item" />
                      <button onClick={()=>{
                        const val = document.getElementById('manual-item').value.trim();
                        if (val) {
                          setItems(prev => [...prev, { id:nextId.current++, productId:null, name:val, brand:'', emoji:'🛒', barcode:null, price:0, unit:'item', qty:1 }]);
                          document.getElementById('manual-item').value = '';
                        }
                      }} style={{ padding:'12px 16px', background:theme.primary, color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'Inter',sans-serif" }}>Add</button>
                    </div>
                  </details>
                </div>
              )}

              {/* ── QUEUE FORM ── */}
              {errand.type==='hourly' && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Where Is the Queue? *</label>
                    <input className="b-inp" style={inp} placeholder="e.g. Hull Post Office, Jameson Street" value={queueLocation} onChange={e=>setQueueLocation(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:10, textTransform:'uppercase' }}>Estimated Queue Time</label>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {[30,45,60,90,120].map(m => (
                        <button key={m} onClick={()=>setQueueMins(m)} style={{ flex:1, minWidth:60, padding:'11px 8px', borderRadius:12, border:`1.5px solid ${queueMins===m?'#D97706':theme.border}`, background:queueMins===m?'#D9770618':theme.card2, color:queueMins===m?'#D97706':theme.muted, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                          {m < 60 ? `${m} min` : `${m/60} hr`}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop:10, background:theme.card2, border:`1px solid #D9770633`, borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:13, color:theme.muted }}>Estimated fee</span>
                      <span style={{ fontSize:16, fontWeight:800, color:'#D97706', fontFamily:"'Outfit',sans-serif" }}>£{calcQueueFee(queueMins).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DISTANCE PICKER (Buy & Parcel) ── */}
              {(errand.id==='buy'||errand.id==='parcel') && (
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:8, textTransform:'uppercase' }}>Distance</label>
                  <div style={{ display:'flex', gap:10 }}>
                    {[['under2','Under 2 miles','£6.99'],['over2','Over 2 miles','£9.99']].map(([val,label,price]) => (
                      <button key={val} onClick={()=>setDistanceMiles(val)} style={{ flex:1, padding:'14px 10px', borderRadius:14, border:`1.5px solid ${distanceMiles===val?theme.primary:theme.border}`, background:distanceMiles===val?theme.primaryBg:theme.card2, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', textAlign:'center' }}>
                        <div style={{ fontSize:18, fontWeight:900, color:distanceMiles===val?theme.primary:theme.text, fontFamily:"'Outfit',sans-serif" }}>{price}</div>
                        <div style={{ fontSize:12, color:theme.muted, marginTop:3 }}>{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── BUY DETAILS ── */}
              {errand.id==='buy' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>What Do You Need? *</label>
                    <textarea className="b-inp" style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder="e.g. Size 9 Nike Air Force 1 in white from JD Sports on Whitefriargate" value={buyDescription} onChange={e=>setBuyDescription(e.target.value)} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Shop Name</label>
                      <input className="b-inp" style={inp} placeholder="e.g. JD Sports" value={buyShop} onChange={e=>setBuyShop(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Item Price (£)</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:theme.muted }}>£</span>
                        <input className="b-inp" style={{ ...inp, paddingLeft:28 }} type="number" placeholder="0.00" value={buyPrice} onChange={e=>setBuyPrice(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PARCEL DETAILS ── */}
              {errand.id==='parcel' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div style={{ display:'flex', gap:10 }}>
                    {[['return','📦 Return'],['collect','🏃 Collect'],['dropoff','📮 Drop-off']].map(([val,label]) => (
                      <button key={val} onClick={()=>setParcelType(val)} style={{ flex:1, padding:'11px 8px', borderRadius:12, border:`1.5px solid ${parcelType===val?theme.primary:theme.border}`, background:parcelType===val?theme.primaryBg:theme.card2, color:parcelType===val?theme.primary:theme.muted, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>{label}</button>
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Carrier / Drop-off Point *</label>
                    <input className="b-inp" style={inp} placeholder="e.g. Evri, Royal Mail, Argos, Post Office" value={parcelCarrier} onChange={e=>setParcelCarrier(e.target.value)} />
                  </div>
                </div>
              )}

              {/* ── PHARMACY ── */}
              {errand.id==='pharmacy' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div style={{ display:'flex', gap:10 }}>
                    {[['nhs','NHS'],['private','Private'],['otc','Over Counter']].map(([val,label]) => (
                      <button key={val} onClick={()=>setScriptType(val)} style={{ flex:1, padding:'11px 8px', borderRadius:12, border:`1.5px solid ${scriptType===val?'#DB2777':theme.border}`, background:scriptType===val?'#DB277718':theme.card2, color:scriptType===val?'#DB2777':theme.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>{label}</button>
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Pharmacy (optional)</label>
                    <input className="b-inp" style={inp} placeholder="e.g. Boots Princes Quay" value={pharmacyName} onChange={e=>setPharmacyName(e.target.value)} />
                  </div>
                </div>
              )}

              {/* ── ADDRESS ── */}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Delivery Address *</label>
                <input className="b-inp" style={{ ...inp, marginBottom:10 }} placeholder="House number and street" value={address} onChange={e=>setAddress(e.target.value)} />
                <input className="b-inp" style={inp} placeholder="Postcode e.g. HU5 2RQ" value={postcode} onChange={e=>setPostcode(e.target.value.toUpperCase())} />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Extra Notes (optional)</label>
                <textarea className="b-inp" style={{ ...inp, minHeight:60, resize:'vertical' }} placeholder="e.g. Leave at door if no answer. Buzzer code 1234." value={notes} onChange={e=>setNotes(e.target.value)} />
              </div>

              {error && <div style={{ background:'#FEE2E2', border:'1px solid #EF444433', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#EF4444', fontWeight:600 }}>⚠️ {error}</div>}

              <button onClick={()=>{ if(validateStep1()) setStep(2); }} style={{ width:'100%', padding:16, borderRadius:14, border:'none', background:'linear-gradient(135deg, #6366F1, #4338CA)', color:'#fff', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:"'Outfit',sans-serif", boxShadow:'0 6px 24px rgba(99,102,241,0.35)' }}>
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirm ── */}
        {step===2 && errand && (
          <div>
            <button onClick={()=>{setStep(1);setError('');}} style={{ background:'none', border:'none', color:theme.muted, fontSize:13, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', gap:6, fontFamily:"'Inter',sans-serif" }}>← Back</button>

            <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:18, overflow:'hidden', marginBottom:20 }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${theme.border}`, fontSize:12, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5 }}>Order Summary</div>

              {errand.type==='grocery' && items.length > 0 && (
                <div style={{ padding:'14px 20px', borderBottom:`1px solid ${theme.border}` }}>
                  <div style={{ fontSize:12, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>
                    Shopping List — {HULL_STORES.find(s=>s.id===store)?.name}
                  </div>
                  {items.map(i => (
                    <div key={i.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <ProductImage product={i} size={32} />
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:theme.text }}>{i.qty}× {i.name}</span>
                        <span style={{ fontSize:12, color:theme.muted }}> · {i.brand} · {i.unit}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:'#059669' }}>~£{(i.price*i.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding:'14px 20px' }}>
                {[
                  ['Errand', `${errand.icon} ${errand.label}`],
                  ['Deliver to', `${address}, ${postcode}`],
                  ...(notes ? [['Notes', notes]] : []),
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:12, marginBottom:10, fontSize:14 }}>
                    <span style={{ color:theme.muted }}>{k}</span>
                    <span style={{ fontWeight:600, color:theme.text, textAlign:'right' }}>{v}</span>
                  </div>
                ))}

                <div style={{ background:isDark?theme.bg2:'#F0FDF4', borderRadius:12, padding:'14px 16px', marginTop:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:theme.text }}>Service Fee</span>
                    <span style={{ fontSize:26, fontWeight:900, color:theme.primary, fontFamily:"'Outfit',sans-serif" }}>£{fee.toFixed(2)}</span>
                  </div>
                  {errand.type==='grocery' && (
                    <div style={{ fontSize:12, color:theme.muted }}>+ ~£{basketTotal.toFixed(2)} basket (paid to store directly)</div>
                  )}
                  <div style={{ fontSize:12, color:'#059669', marginTop:6, fontWeight:600 }}>✓ Only charged after your errand is complete</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Payment</div>
              <div style={{ display:'flex', gap:10 }}>
                {[['card','💳','Pay by Card','Visa, Mastercard, Amex'],['paypal','🅿️','PayPal','Pay with PayPal']].map(([val,icon,label,sub]) => (
                  <button key={val} onClick={()=>setPayment(val)} style={{ flex:1, padding:'14px 12px', borderRadius:14, border:`1.5px solid ${payment===val?theme.primary:theme.border}`, background:payment===val?theme.primaryBg:theme.card, cursor:'pointer', textAlign:'center', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}>
                    <div style={{ fontSize:22 }}>{icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:payment===val?theme.primary:theme.text, marginTop:4 }}>{label}</div>
                    <div style={{ fontSize:11, color:theme.muted }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ background:'#FEE2E2', border:'1px solid #EF444433', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#EF4444', fontWeight:600, marginBottom:16 }}>⚠️ {error}</div>}

            <button onClick={submitOrder} disabled={submitting} style={{ width:'100%', padding:17, borderRadius:14, border:'none', background:submitting?theme.muted:'linear-gradient(135deg, #6366F1, #4338CA)', color:'#fff', fontSize:17, fontWeight:800, cursor:submitting?'not-allowed':'pointer', fontFamily:"'Outfit',sans-serif", boxShadow:submitting?'none':'0 6px 24px rgba(99,102,241,0.35)', transition:'all 0.2s' }}>
              {submitting ? '⏳ Placing Order...' : `Confirm & Book — £${fee.toFixed(2)} →`}
            </button>
            <div style={{ textAlign:'center', fontSize:12, color:theme.muted, marginTop:12 }}>Only charged after your errand is completed</div>
          </div>
        )}
      </div>
    </div>
  );
}

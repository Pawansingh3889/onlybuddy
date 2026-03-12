import { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// ─── Pricing constants ────────────────────────────────────────
const PRICING = {
  GROCERY_RATE:       0.15,   // 15% of basket
  GROCERY_MIN:        4.99,   // minimum grocery fee
  DISTANCE_SHORT:     6.99,   // under 2 miles
  DISTANCE_LONG:      9.99,   // over 2 miles
  QUEUE_SLOT:         4.00,   // per 30-minute slot
  QUEUE_MIN_MINUTES:  30,
  PRESCRIPTION_FLAT:  6.99,
};
// ─────────────────────────────────────────────────────────────

const ERRAND_TYPES = [
  { id:'grocery',  icon:'🛒', label:'Grocery Run',      color:'#059669', pricing:'15% of basket (min £4.99)',  type:'grocery' },
  { id:'buy',      icon:'🛍️', label:'Buy & Deliver',    color:'#7C3AED', pricing:'£6.99 / £9.99 by distance',  type:'distance' },
  { id:'queue',    icon:'⏳', label:'Queue for Me',      color:'#D97706', pricing:'£8.00/hr · min 30 min',      type:'hourly' },
  { id:'parcel',   icon:'📦', label:'Parcel & Returns', color:'#2563EB', pricing:'£6.99 / £9.99 by distance',  type:'distance' },
  { id:'pharmacy', icon:'💊', label:'Prescription Run', color:'#DB2777', pricing:'£6.99 flat — all of Hull',   type:'flat', fee:PRICING.PRESCRIPTION_FLAT },
];

const HULL_STORES = [
  { id:'morrisons',  icon:'🟡', name:"Morrisons" },
  { id:'tesco',      icon:'🔵', name:'Tesco' },
  { id:'asda',       icon:'🟢', name:'Asda' },
  { id:'sainsburys', icon:'🟠', name:"Sainsbury's" },
  { id:'aldi',       icon:'🔴', name:'Aldi' },
  { id:'lidl',       icon:'🟤', name:'Lidl' },
  { id:'coop',       icon:'⚫', name:'Co-op' },
  { id:'other',      icon:'🏪', name:'Other / Local Shop' },
];

// Common grocery suggestions for autocomplete
const GROCERY_SUGGESTIONS = [
  'Whole milk (2 pints)', 'Semi-skimmed milk (2 pints)', 'Bread (medium sliced)',
  'Eggs (6 free range)', 'Eggs (12 free range)', 'Butter (250g)',
  'Cheddar cheese (400g)', 'Chicken breast (500g)', 'Mince beef (500g)',
  'Pasta (500g)', 'Rice (1kg)', 'Baked beans (4 pack)',
  'Tinned tomatoes (400g)', 'Orange juice (1L)', 'Bananas (bunch)',
  'Apples (bag)', 'Potatoes (1.5kg)', 'Carrots (1kg)',
  'Onions (1kg)', 'Toilet roll (9 pack)', 'Washing up liquid',
  'Paracetamol (16 tablets)', 'Ibuprofen (16 tablets)',
];

const calcGroceryFee = (total) => Math.max(total * PRICING.GROCERY_RATE, PRICING.GROCERY_MIN);

const calcDistanceFee = (miles) => miles <= 2 ? PRICING.DISTANCE_SHORT : PRICING.DISTANCE_LONG;

const calcQueueFee = (mins) => {
  const slots = Math.ceil(Math.max(mins, PRICING.QUEUE_MIN_MINUTES) / PRICING.QUEUE_MIN_MINUTES);
  return slots * PRICING.QUEUE_SLOT;
};

export default function BookingPage() {
  const { theme, isDark } = useTheme();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(0); // 0=pick type, 1=details, 2=confirm
  const [errand, setErrand] = useState(null);
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  // ── Grocery state ──
  const [store, setStore] = useState('');
  const [items, setItems] = useState([{ id:1, name:'', qty:1, unit:'item' }]);
  const [basketEstimate, setBasketEstimate] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const nextId = useRef(2);

  // ── Queue state ──
  const [queueMins, setQueueMins] = useState(30);
  const [queueLocation, setQueueLocation] = useState('');

  // ── Distance state ──
  const [distanceMiles, setDistanceMiles] = useState('under2');

  // ── Buy & Deliver state ──
  const [buyDescription, setBuyDescription] = useState('');
  const [buyShop, setBuyShop] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  // ── Parcel state ──
  const [parcelCarrier, setParcelCarrier] = useState('');
  const [parcelType, setParcelType] = useState('return');

  // ── Pharmacy state ──
  const [pharmacyName, setPharmacyName] = useState('');
  const [scriptType, setScriptType] = useState('nhs');

  // ─── Fee calculation ───────────────────────────────────
  const calcFee = () => {
    if (!errand) return 0;
    if (errand.type === 'grocery') {
      const est = parseFloat(basketEstimate) || 0;
      return est > 0 ? calcGroceryFee(est) : 4.99;
    }
    if (errand.type === 'distance') return calcDistanceFee(distanceMiles === 'under2' ? 1 : 3);
    if (errand.type === 'hourly')   return calcQueueFee(queueMins);
    if (errand.type === 'flat')     return errand.fee;
    return 0;
  };

  // ─── Grocery list helpers ──────────────────────────────
  const addItem = () => {
    setItems(prev => [...prev, { id: nextId.current++, name:'', qty:1, unit:'item' }]);
  };
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id, key, val) => setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));

  const handleItemNameChange = (id, val) => {
    updateItem(id, 'name', val);
    setEditingIdx(id);
    if (val.length > 1) {
      setSuggestions(GROCERY_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const pickSuggestion = (id, suggestion) => {
    updateItem(id, 'name', suggestion);
    setSuggestions([]);
    setEditingIdx(null);
  };

  // ─── Validation ────────────────────────────────────────
  const validateStep1 = () => {
    if (!address.trim())  { setError('Please enter your delivery address'); return false; }
    if (!postcode.trim()) { setError('Please enter your postcode'); return false; }
    if (errand?.type === 'grocery') {
      if (!store) { setError('Please select a store'); return false; }
      if (items.filter(i => i.name.trim()).length === 0) { setError('Please add at least one item'); return false; }
    }
    if (errand?.type === 'hourly' && !queueLocation.trim()) { setError('Please enter the queue location'); return false; }
    if (errand?.id === 'buy' && !buyDescription.trim()) { setError('Please describe what you need bought'); return false; }
    if (errand?.id === 'parcel' && !parcelCarrier.trim()) { setError('Please enter the carrier/drop-off point'); return false; }
    setError('');
    return true;
  };

  // ─── Submit ────────────────────────────────────────────
  const submitOrder = async () => {
    setSubmitting(true); setError('');
    try {
      const groceryData = errand?.type === 'grocery' ? {
        store,
        items: items.filter(i => i.name.trim()),
        basketEstimate: parseFloat(basketEstimate) || null,
      } : {};

      const queueData = errand?.type === 'hourly' ? {
        queueLocation,
        estimatedMinutes: queueMins,
      } : {};

      const buyData = errand?.id === 'buy' ? {
        buyDescription, buyShop, buyPrice: parseFloat(buyPrice) || null,
      } : {};

      const parcelData = errand?.id === 'parcel' ? {
        parcelCarrier, parcelType,
      } : {};

      const pharmacyData = errand?.id === 'pharmacy' ? {
        pharmacyName, scriptType,
      } : {};

      const docRef = await addDoc(collection(db, 'orders'), {
        errandType: errand.label,
        errandId: errand.id,
        address,
        postcode: postcode.toUpperCase(),
        notes,
        serviceFee: calcFee(),
        distanceBand: errand.type === 'distance' ? distanceMiles : null,
        paymentMethod: payment,
        status: 'pending',
        customerId: currentUser?.uid || 'guest',
        customerEmail: currentUser?.email || '',
        customerName: currentUser?.displayName || '',
        ...groceryData,
        ...queueData,
        ...buyData,
        ...parcelData,
        ...pharmacyData,
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ─── Styles ────────────────────────────────────────────
  const inp = { width:'100%', background:theme.card2, border:`1.5px solid ${theme.border}`, borderRadius:12, padding:'12px 15px', color:theme.text, fontSize:14, fontFamily:"'Inter',sans-serif", outline:'none' };
  const fee = calcFee();

  // ─── Submitted ─────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:520, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontSize:28, fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text, marginBottom:12 }}>Order Confirmed!</h1>
        <p style={{ fontSize:15, color:theme.muted, lineHeight:1.8, marginBottom:28 }}>
          We're matching you with a nearby Buddy. You'll get a text when they accept.
        </p>
        <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:18, padding:'24px 28px', textAlign:'left', marginBottom:24 }}>
          <div style={{ fontSize:12, color:theme.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 }}>Order Summary</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8 }}>
            <span style={{ color:theme.muted }}>Errand</span><span style={{ fontWeight:700, color:theme.text }}>{errand.label}</span>
          </div>
          {errand.type === 'grocery' && store && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8 }}>
              <span style={{ color:theme.muted }}>Store</span><span style={{ fontWeight:600, color:theme.text }}>{HULL_STORES.find(s=>s.id===store)?.name}</span>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8 }}>
            <span style={{ color:theme.muted }}>Deliver to</span><span style={{ fontWeight:600, color:theme.text }}>{postcode.toUpperCase()}</span>
          </div>
          <div style={{ borderTop:`1px solid ${theme.border}`, marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, color:theme.muted }}>Service Fee</span>
            <span style={{ fontSize:20, fontWeight:900, color:theme.primary, fontFamily:"'Outfit',sans-serif" }}>£{fee.toFixed(2)}</span>
          </div>
          {errand.type === 'grocery' && (
            <div style={{ fontSize:12, color:theme.muted, marginTop:6 }}>+ basket cost (paid directly to store)</div>
          )}
        </div>
        <div style={{ fontSize:13, color:theme.muted, marginBottom:24 }}>Order ID: <span style={{ fontFamily:'monospace', color:theme.text2 }}>{orderId.slice(0,8).toUpperCase()}</span></div>
        <Link to="/" style={{ textDecoration:'none', display:'inline-block', background:`linear-gradient(135deg, #6366F1, #4338CA)`, color:'#fff', padding:'13px 32px', borderRadius:14, fontSize:15, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>Back to Home</Link>
      </div>
    </div>
  );

  const UNIT_OPTIONS = ['item','pack','kg','g','L','ml','loaf','bunch','box','bottle','tin','bag','jar','roll'];

  // ─── Grocery list UI ───────────────────────────────────
  const GroceryList = () => (
    <div>
      {/* Store picker */}
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:8, textTransform:'uppercase' }}>Which Store? *</label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
          {HULL_STORES.map(s => (
            <button key={s.id} onClick={()=>setStore(s.id)} style={{ padding:'10px 6px', borderRadius:12, border:`1.5px solid ${store===s.id ? '#059669' : theme.border}`, background:store===s.id ? '#05966918' : theme.card2, color:store===s.id ? '#059669' : theme.muted, fontSize:12, fontWeight:700, cursor:'pointer', textAlign:'center', transition:'all 0.15s', fontFamily:"'Inter',sans-serif" }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Item list */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, textTransform:'uppercase' }}>Shopping List * ({items.filter(i=>i.name.trim()).length} items)</label>
          <button onClick={addItem} style={{ fontSize:12, color:theme.primary, fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:'4px 8px', fontFamily:"'Inter',sans-serif" }}>+ Add Item</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {items.map((item, idx) => (
            <div key={item.id} style={{ position:'relative' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {/* Quantity */}
                <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                  <button onClick={()=>updateItem(item.id,'qty',Math.max(1,item.qty-1))} style={{ width:28, height:28, borderRadius:8, border:`1px solid ${theme.border}`, background:theme.card2, color:theme.text, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>−</button>
                  <span style={{ minWidth:24, textAlign:'center', fontSize:14, fontWeight:700, color:theme.text }}>{item.qty}</span>
                  <button onClick={()=>updateItem(item.id,'qty',item.qty+1)} style={{ width:28, height:28, borderRadius:8, border:`1px solid ${theme.border}`, background:theme.card2, color:theme.text, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>+</button>
                </div>
                {/* Unit */}
                <select value={item.unit} onChange={e=>updateItem(item.id,'unit',e.target.value)} style={{ ...inp, width:70, padding:'10px 6px', flexShrink:0, fontSize:12 }}>
                  {UNIT_OPTIONS.map(u=><option key={u}>{u}</option>)}
                </select>
                {/* Name */}
                <div style={{ flex:1, position:'relative' }}>
                  <input
                    className="booking-inp"
                    style={{ ...inp }}
                    placeholder="e.g. Semi-skimmed milk"
                    value={item.name}
                    onChange={e=>handleItemNameChange(item.id, e.target.value)}
                    onFocus={()=>setEditingIdx(item.id)}
                    onBlur={()=>setTimeout(()=>setSuggestions([]),150)}
                  />
                  {/* Autocomplete dropdown */}
                  {editingIdx === item.id && suggestions.length > 0 && (
                    <div style={{ position:'absolute', top:'100%', left:0, right:0, background:theme.card, border:`1px solid ${theme.primary}44`, borderRadius:10, zIndex:50, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', marginTop:3 }}>
                      {suggestions.map(s=>(
                        <div key={s} onMouseDown={()=>pickSuggestion(item.id, s)} style={{ padding:'10px 14px', fontSize:13, color:theme.text2, cursor:'pointer', borderBottom:`1px solid ${theme.border}` }}
                          onMouseEnter={e=>e.currentTarget.style.background=theme.bg2}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        >{s}</div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Remove */}
                {items.length > 1 && (
                  <button onClick={()=>removeItem(item.id)} style={{ width:28, height:28, borderRadius:8, border:`1px solid ${theme.border}`, background:theme.redBg||'#FEE2E2', color:'#EF4444', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={addItem} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:12, border:`1.5px dashed ${theme.border}`, background:'none', color:theme.primary, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
          + Add Another Item
        </button>
      </div>

      {/* Basket estimate */}
      <div style={{ marginTop:16 }}>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Estimated Basket Total (£) — optional but helps us match faster</label>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:theme.muted, fontSize:15 }}>£</span>
          <input className="booking-inp" style={{ ...inp, paddingLeft:28 }} type="number" min="0" step="0.01" placeholder="e.g. 35.00" value={basketEstimate} onChange={e=>setBasketEstimate(e.target.value)} />
        </div>
        {basketEstimate && parseFloat(basketEstimate) > 0 && (
          <div style={{ marginTop:8, background:theme.card2, border:`1px solid #05966933`, borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:theme.muted }}>Your service fee</span>
            <span style={{ fontSize:16, fontWeight:800, color:'#059669', fontFamily:"'Outfit',sans-serif" }}>£{calcGroceryFee(parseFloat(basketEstimate)).toFixed(2)}</span>
          </div>
        )}
        <div style={{ fontSize:12, color:theme.muted, marginTop:6, lineHeight:1.6 }}>
          15% of basket total (min £4.99). You pay the store separately — your Buddy uses your payment details at checkout or you can hand cash.
        </div>
      </div>
    </div>
  );

  // ─── Queue UI ─────────────────────────────────────────
  const QueueForm = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Where Is the Queue? *</label>
        <input className="booking-inp" style={inp} placeholder="e.g. Hull Post Office, Jameson Street" value={queueLocation} onChange={e=>setQueueLocation(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:10, textTransform:'uppercase' }}>Estimated Queue Time</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[30,45,60,90,120].map(m=>(
            <button key={m} onClick={()=>setQueueMins(m)} style={{ flex:1, minWidth:60, padding:'11px 8px', borderRadius:12, border:`1.5px solid ${queueMins===m?'#D97706':theme.border}`, background:queueMins===m?'#D9770618':theme.card2, color:queueMins===m?'#D97706':theme.muted, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
              {m < 60 ? `${m} min` : `${m/60} hr`}
            </button>
          ))}
        </div>
        <div style={{ marginTop:10, background:theme.card2, border:`1px solid #D9770633`, borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:theme.muted }}>Estimated fee</span>
          <span style={{ fontSize:16, fontWeight:800, color:'#D97706', fontFamily:"'Outfit',sans-serif" }}>£{calcQueueFee(queueMins).toFixed(2)}</span>
        </div>
        <div style={{ fontSize:12, color:theme.muted, marginTop:6 }}>£4.00 per 30 minutes. Only charged for actual queue time.</div>
      </div>
    </div>
  );

  // ─── Distance picker ──────────────────────────────────
  const DistancePicker = () => (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:8, textTransform:'uppercase' }}>Distance from Buddy</label>
      <div style={{ display:'flex', gap:10 }}>
        {[['under2','Under 2 miles','£6.99'],['over2','Over 2 miles','£9.99']].map(([val,label,price])=>(
          <button key={val} onClick={()=>setDistanceMiles(val)} style={{ flex:1, padding:'14px 10px', borderRadius:14, border:`1.5px solid ${distanceMiles===val?theme.primary:theme.border}`, background:distanceMiles===val?theme.primaryBg:theme.card2, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}>
            <div style={{ fontSize:18, fontWeight:900, color:distanceMiles===val?theme.primary:theme.text, fontFamily:"'Outfit',sans-serif" }}>{price}</div>
            <div style={{ fontSize:12, color:theme.muted, marginTop:3 }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Buy & Deliver form ───────────────────────────────
  const BuyForm = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <DistancePicker />
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>What Do You Need? *</label>
        <textarea className="booking-inp" style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder="e.g. Size 9 Nike Air Force 1 in white from JD Sports on Whitefriargate" value={buyDescription} onChange={e=>setBuyDescription(e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Shop Name</label>
          <input className="booking-inp" style={inp} placeholder="e.g. JD Sports" value={buyShop} onChange={e=>setBuyShop(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Item Price (£)</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:theme.muted }}>£</span>
            <input className="booking-inp" style={{ ...inp, paddingLeft:28 }} type="number" placeholder="0.00" value={buyPrice} onChange={e=>setBuyPrice(e.target.value)} />
          </div>
        </div>
      </div>
      <div style={{ background:theme.card2, border:`1px solid ${theme.primary}33`, borderRadius:10, padding:'10px 14px', fontSize:13, color:theme.muted, lineHeight:1.6 }}>
        💡 Your Buddy will purchase the item and you repay the exact price + the service fee above. Buddy always sends you a receipt photo.
      </div>
    </div>
  );

  // ─── Parcel form ──────────────────────────────────────
  const ParcelForm = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <DistancePicker />
      <div style={{ display:'flex', gap:10 }}>
        {[['return','📦 Return'],['collect','🏃 Collect'],['dropoff','📮 Drop-off']].map(([val,label])=>(
          <button key={val} onClick={()=>setParcelType(val)} style={{ flex:1, padding:'11px 8px', borderRadius:12, border:`1.5px solid ${parcelType===val?theme.primary:theme.border}`, background:parcelType===val?theme.primaryBg:theme.card2, color:parcelType===val?theme.primary:theme.muted, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
            {label}
          </button>
        ))}
      </div>
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Carrier / Drop-off Point *</label>
        <input className="booking-inp" style={inp} placeholder="e.g. Evri, Royal Mail, Argos, Post Office" value={parcelCarrier} onChange={e=>setParcelCarrier(e.target.value)} />
      </div>
    </div>
  );

  // ─── Pharmacy form ────────────────────────────────────
  const PharmacyForm = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', gap:10 }}>
        {[['nhs','NHS Prescription'],['private','Private'],['otc','Over the Counter']].map(([val,label])=>(
          <button key={val} onClick={()=>setScriptType(val)} style={{ flex:1, padding:'11px 8px', borderRadius:12, border:`1.5px solid ${scriptType===val?'#DB2777':theme.border}`, background:scriptType===val?'#DB277718':theme.card2, color:scriptType===val?'#DB2777':theme.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
            {label}
          </button>
        ))}
      </div>
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Pharmacy Name (optional)</label>
        <input className="booking-inp" style={inp} placeholder="e.g. Boots Princes Quay, Lloyds Beverley Road" value={pharmacyName} onChange={e=>setPharmacyName(e.target.value)} />
      </div>
      <div style={{ background:'#DB277710', border:'1px solid #DB277733', borderRadius:10, padding:'10px 14px', fontSize:13, color:theme.muted, lineHeight:1.6 }}>
        🔒 Your Buddy will verify ID at the pharmacy if required by the pharmacist. NHS prescriptions are collected with your HC2/HC3 certificate if applicable.
      </div>
    </div>
  );

  return (
    <div style={{ background:theme.bg, minHeight:'100vh', overflowX:'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .booking-inp:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}22; outline: none; }
      `}</style>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'clamp(28px,5vw,52px) 20px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:'clamp(24px,5vw,36px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text, marginBottom:8 }}>Book a Buddy</h1>
          <p style={{ fontSize:14, color:theme.muted }}>Matched with a local Hull Buddy in minutes. Pay only when done.</p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:8, marginBottom:32, alignItems:'center' }}>
          {['Pick Errand','Details','Confirm'].map((label,i)=>(
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8, flex:i<2?1:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:step>=i?theme.primary:theme.card2, border:`2px solid ${step>=i?theme.primary:theme.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:step>=i?'#fff':theme.muted, flexShrink:0 }}>{step>i?'✓':i+1}</div>
                <span style={{ fontSize:13, fontWeight:step===i?700:500, color:step===i?theme.text:theme.muted, whiteSpace:'nowrap' }}>{label}</span>
              </div>
              {i<2&&<div style={{ flex:1, height:2, background:step>i?theme.primary:theme.border, borderRadius:1 }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Pick errand type ── */}
        {step === 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>What do you need?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {ERRAND_TYPES.map(e=>(
                <button key={e.id} onClick={()=>{setErrand(e);setStep(1);setError('');}} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:theme.card, border:`1.5px solid ${errand?.id===e.id?e.color:theme.border}`, borderRadius:16, cursor:'pointer', textAlign:'left', transition:'all 0.15s', fontFamily:"'Inter',sans-serif", borderLeft:`4px solid ${e.color}` }}>
                  <span style={{ fontSize:30, flexShrink:0 }}>{e.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:theme.text, fontFamily:"'Outfit',sans-serif" }}>{e.label}</div>
                    <div style={{ fontSize:12, color:theme.muted, marginTop:2 }}>{e.pricing}</div>
                  </div>
                  <div style={{ fontSize:18, color:theme.muted }}>→</div>
                </button>
              ))}
            </div>
            {!currentUser && (
              <div style={{ background:theme.primaryBg, border:`1px solid ${theme.primary}33`, borderRadius:12, padding:'12px 16px', fontSize:13, color:theme.muted }}>
                💡 <Link to="/login" style={{ color:theme.primary, fontWeight:700 }}>Sign in</Link> to track orders, get Buddy updates, and re-order in one tap.
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && errand && (
          <div>
            <button onClick={()=>{setStep(0);setError('');}} style={{ background:'none', border:'none', color:theme.muted, fontSize:13, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', gap:6, fontFamily:"'Inter',sans-serif" }}>
              ← Back
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'14px 18px', background:theme.card, border:`1.5px solid ${errand.color}33`, borderRadius:14, borderLeft:`4px solid ${errand.color}` }}>
              <span style={{ fontSize:26 }}>{errand.icon}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:theme.text, fontFamily:"'Outfit',sans-serif" }}>{errand.label}</div>
                <div style={{ fontSize:12, color:theme.muted }}>{errand.pricing}</div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Errand-specific form */}
              {errand.type === 'grocery' && <GroceryList />}
              {errand.type === 'hourly'  && <QueueForm />}
              {errand.id   === 'buy'     && <BuyForm />}
              {errand.id   === 'parcel'  && <ParcelForm />}
              {errand.id   === 'pharmacy'&& <PharmacyForm />}

              {/* Delivery address */}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>
                  {errand.type === 'grocery' ? 'Deliver To *' : errand.type === 'hourly' ? 'Your Address (for drop-off) *' : 'Delivery / Collection Address *'}
                </label>
                <input className="booking-inp" style={{ ...inp, marginBottom:10 }} placeholder="House number and street" value={address} onChange={e=>setAddress(e.target.value)} />
                <input className="booking-inp" style={inp} placeholder="Postcode e.g. HU5 2RQ" value={postcode} onChange={e=>setPostcode(e.target.value.toUpperCase())} />
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:theme.muted, letterSpacing:0.5, display:'block', marginBottom:6, textTransform:'uppercase' }}>Any Extra Notes? (optional)</label>
                <textarea className="booking-inp" style={{ ...inp, minHeight:70, resize:'vertical' }} placeholder="e.g. Leave at door if no answer. Buzzer code 1234." value={notes} onChange={e=>setNotes(e.target.value)} />
              </div>

              {error && <div style={{ background:theme.redBg||'#FEE2E2', border:'1px solid #EF444433', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#EF4444', fontWeight:600 }}>⚠️ {error}</div>}

              <button onClick={()=>{ if(validateStep1()) setStep(2); }} style={{ width:'100%', padding:16, borderRadius:14, border:'none', background:`linear-gradient(135deg, #6366F1, #4338CA)`, color:'#fff', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:"'Outfit',sans-serif", boxShadow:'0 6px 24px rgba(99,102,241,0.35)' }}>
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirm ── */}
        {step === 2 && errand && (
          <div>
            <button onClick={()=>{setStep(1);setError('');}} style={{ background:'none', border:'none', color:theme.muted, fontSize:13, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', gap:6, fontFamily:"'Inter',sans-serif" }}>
              ← Back
            </button>

            <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:18, padding:'24px', marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:16 }}>Order Summary</div>

              {[
                ['Errand', `${errand.icon} ${errand.label}`],
                ...(errand.type==='grocery'&&store ? [['Store', HULL_STORES.find(s=>s.id===store)?.name]] : []),
                ...(errand.type==='grocery' ? [['Items', `${items.filter(i=>i.name.trim()).length} item${items.filter(i=>i.name.trim()).length!==1?'s':''}`]] : []),
                ...(errand.type==='hourly' ? [['Queue at', queueLocation],['Est. time', `${queueMins} min`]] : []),
                ['Deliver to', `${address}, ${postcode}`],
                ...(notes ? [['Notes', notes]] : []),
              ].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:12, paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${theme.border}`, fontSize:14 }}>
                  <span style={{ color:theme.muted, flexShrink:0 }}>{k}</span>
                  <span style={{ fontWeight:600, color:theme.text, textAlign:'right' }}>{v}</span>
                </div>
              ))}

              {/* Grocery item list preview */}
              {errand.type==='grocery' && items.filter(i=>i.name.trim()).length > 0 && (
                <div style={{ background:theme.bg2, borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:theme.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Shopping List</div>
                  {items.filter(i=>i.name.trim()).map(i=>(
                    <div key={i.id} style={{ fontSize:13, color:theme.text2, marginBottom:5, display:'flex', gap:8 }}>
                      <span style={{ color:theme.primary, fontWeight:700 }}>{i.qty}× {i.unit}</span>
                      <span>{i.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background:theme.bg2, borderRadius:12, padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:theme.text }}>Service Fee</span>
                  <span style={{ fontSize:26, fontWeight:900, color:theme.primary, fontFamily:"'Outfit',sans-serif" }}>£{fee.toFixed(2)}</span>
                </div>
                {errand.type==='grocery' && (
                  <div style={{ fontSize:12, color:theme.muted, lineHeight:1.6 }}>+ basket cost paid directly to store · 15% of basket (min £4.99)</div>
                )}
                <div style={{ fontSize:12, color:theme.green||'#059669', marginTop:6, fontWeight:600 }}>✓ Only charged after your errand is complete</div>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:theme.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Payment Method</div>
              <div style={{ display:'flex', gap:10 }}>
                {[['card','💳','Pay by Card','Visa, Mastercard, Amex'],['paypal','🅿️','PayPal','Pay with PayPal']].map(([val,icon,label,sub])=>(
                  <button key={val} onClick={()=>setPayment(val)} style={{ flex:1, padding:'14px 12px', borderRadius:14, border:`1.5px solid ${payment===val?theme.primary:theme.border}`, background:payment===val?theme.primaryBg:theme.card, cursor:'pointer', textAlign:'center', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}>
                    <div style={{ fontSize:22 }}>{icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:payment===val?theme.primary:theme.text, marginTop:4 }}>{label}</div>
                    <div style={{ fontSize:11, color:theme.muted }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ background:theme.redBg||'#FEE2E2', border:'1px solid #EF444433', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#EF4444', fontWeight:600, marginBottom:16 }}>⚠️ {error}</div>}

            <button onClick={submitOrder} disabled={submitting} style={{ width:'100%', padding:17, borderRadius:14, border:'none', background:submitting?theme.muted:`linear-gradient(135deg, #6366F1, #4338CA)`, color:'#fff', fontSize:17, fontWeight:800, cursor:submitting?'not-allowed':'pointer', fontFamily:"'Outfit',sans-serif", boxShadow:submitting?'none':'0 6px 24px rgba(99,102,241,0.35)', transition:'all 0.2s' }}>
              {submitting ? '⏳ Placing Order...' : `Confirm & Book — £${fee.toFixed(2)} →`}
            </button>
            <div style={{ textAlign:'center', fontSize:12, color:theme.muted, marginTop:12 }}>
              You will only be charged once your errand is completed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

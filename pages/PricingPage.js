import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SERVICES = [
  { icon:'🛒', name:'Grocery Run',      tag:'Most Popular', tagColor:'#059669', model:'15% of basket', detail:'Minimum £4.99', color:'#059669',
    howItWorks:'You pay the shop directly. We charge 15% of your basket as our service fee (min £4.99). A £40 shop = £6.00 service fee.',
    stores:['Morrisons','Tesco','Asda','Sainsbury\'s','Aldi','Lidl','Co-op','Local shops'] },
  { icon:'🛍️', name:'Buy & Deliver',    model:'£6.99 / £9.99', detail:'Under / over 2 miles', color:'#7C3AED',
    howItWorks:'Buddy buys the item with their own money. You repay the exact shop price + flat service fee. Under 2 miles: £6.99. Over 2 miles: £9.99.' },
  { icon:'⏳', name:'Queue for Me',      model:'£8.00/hr', detail:'Billed in 30-min slots (min £4.00)', color:'#D97706',
    howItWorks:'Charged from when your Buddy joins the queue until they\'re served. Minimum 30 minutes. Billed in 30-min increments.' },
  { icon:'📦', name:'Parcel & Returns', model:'£6.99 / £9.99', detail:'Under / over 2 miles', color:'#2563EB',
    howItWorks:'Flat fee based on distance. Buddy collects or drops off at any carrier point in Hull.' },
  { icon:'💊', name:'Prescription Run', model:'£6.99', detail:'Flat rate — all of Hull', color:'#DB2777',
    howItWorks:'Fixed £6.99 anywhere in Hull. NHS and private prescriptions from any pharmacy.' },
];

const EXAMPLES = [
  { label:'Weekly Tesco shop (£65)', breakdown:['Basket (paid direct): £65.00','Service fee (15%): £9.75'], fee:9.75, note:'More flexible than a delivery slot' },
  { label:'Boots prescription pickup', breakdown:['Prescription (paid direct): varies','OnlyBuddy flat fee: £6.99'], fee:6.99, note:'Saves you 30–45 min' },
  { label:'ASOS return (0.8 miles)', breakdown:['Under 2 miles flat fee: £6.99'], fee:6.99, note:'Never miss a return deadline' },
  { label:'Post Office queue (50 min)', breakdown:['First 30 min: £4.00','Next 20 min (rounded): £4.00'], fee:8.00, note:'Worth it on a busy Monday' },
  { label:'Argos click & collect (2.5 miles)', breakdown:['Over 2 miles flat fee: £9.99'], fee:9.99, note:'Same day, no travel needed' },
  { label:'Morrisons shop (£35)', breakdown:['Basket (paid direct): £35.00','Service fee (15%): £5.25'], fee:5.25, note:'Minimum fee: £4.99' },
];

const FAQ = [
  ['When do I get charged?','Only after your errand is completed. Your card is never charged upfront.'],
  ['What if the Buddy can\'t complete it?','You won\'t be charged. We\'ll reassign or refund within 24 hours.'],
  ['Why 15% for groceries?','A Buddy spends 45–60 min shopping for you. 15% of a £50 basket (£7.50) is fair pay for that time — and cheaper than Deliveroo\'s markup + delivery fee.'],
  ['Are there hidden fees?','None. No surge pricing, no item markups, no automatic tips.'],
  ['Can I tip my Buddy?','Yes — 100% goes to your Buddy instantly. We take nothing.'],
  ['What areas do you cover?','All Hull postcodes HU1–HU17.'],
];

export default function PricingPage() {
  const { theme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(null);

  const heroGrad = isDark
    ? 'linear-gradient(135deg, #0D0720 0%, #1A0F2E 45%, #2D1B4E 100%)'
    : `linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 50%, #8B5CF6 100%)`;

  return (
    <div style={{ background: theme.bg, overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .pc:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(0,0,0,0.1); }
        .faq-r:hover { background: ${theme.bg2} !important; }
        @media(max-width:640px){ .eg-grid{grid-template-columns:1fr!important} .pc-grid{grid-template-columns:1fr!important} }
      `}</style>

      <div style={{ background: heroGrad, padding:'clamp(52px,10vw,80px) 20px', textAlign:'center' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.65)', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Transparent Pricing</div>
        <h1 style={{ fontSize:'clamp(28px,6vw,52px)', fontWeight:800, color:'#fff', fontFamily:"'Outfit',sans-serif", marginBottom:14, lineHeight:1.2 }}>Honest, Simple Pricing</h1>
        <p style={{ fontSize:'clamp(14px,2.5vw,18px)', color:'rgba(255,255,255,0.82)', maxWidth:480, margin:'0 auto 24px', lineHeight:1.7 }}>Pay only when your errand is done. No subscriptions, no surge pricing.</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          {['✓ Pay after delivery','✓ No subscriptions','✓ No surge pricing','✓ 100% tips to Buddy'].map(b=>(
            <div key={b} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:20, padding:'6px 14px', fontSize:12, color:'#fff', fontWeight:600 }}>{b}</div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1040, margin:'0 auto', padding:'clamp(48px,8vw,72px) 20px' }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h2 style={{ fontSize:'clamp(22px,4vw,34px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text }}>Pricing by Service</h2>
          <p style={{ fontSize:14, color:theme.muted, marginTop:8 }}>Tap any card to see exactly how it works</p>
        </div>

        <div className="pc-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14, marginBottom:60 }}>
          {SERVICES.map((s,i)=>(
            <div key={s.name} className="pc" onClick={()=>setExpanded(expanded===i?null:i)} style={{ background:theme.card, border:`1.5px solid ${expanded===i?s.color:theme.border}`, borderRadius:18, padding:24, cursor:'pointer', transition:'all 0.2s', borderTop:`4px solid ${s.color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ fontSize:36 }}>{s.icon}</div>
                {s.tag&&<div style={{ fontSize:10, fontWeight:700, background:s.tagColor+'22', color:s.tagColor, borderRadius:20, padding:'3px 10px' }}>{s.tag}</div>}
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:theme.text, fontFamily:"'Outfit',sans-serif", marginBottom:4 }}>{s.name}</div>
              <div style={{ fontSize:24, fontWeight:900, color:s.color, fontFamily:"'Outfit',sans-serif" }}>{s.model}</div>
              <div style={{ fontSize:12, color:theme.muted, marginBottom:12 }}>{s.detail}</div>
              {expanded===i&&(
                <div style={{ borderTop:`1px solid ${theme.border}`, paddingTop:14 }}>
                  <div style={{ fontSize:13, color:theme.text2, lineHeight:1.75, marginBottom:s.stores?12:0 }}>{s.howItWorks}</div>
                  {s.stores&&<div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{s.stores.map(st=><span key={st} style={{ fontSize:11, background:theme.bg2, border:`1px solid ${theme.border}`, borderRadius:20, padding:'3px 10px', color:theme.text2 }}>{st}</span>)}</div>}
                </div>
              )}
              <div style={{ fontSize:12, color:s.color, fontWeight:600, marginTop:10 }}>{expanded===i?'▲ Less':'▼ How it works'}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h2 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text }}>Real Order Examples</h2>
          <p style={{ fontSize:14, color:theme.muted, marginTop:8 }}>What you'd actually pay for common Hull errands</p>
        </div>
        <div className="eg-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:60 }}>
          {EXAMPLES.map(ex=>(
            <div key={ex.label} style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:22 }}>
              <div style={{ fontSize:14, fontWeight:700, color:theme.text, fontFamily:"'Outfit',sans-serif", marginBottom:12 }}>{ex.label}</div>
              {ex.breakdown.map(b=><div key={b} style={{ fontSize:13, color:theme.muted, marginBottom:5, display:'flex', gap:6 }}><span style={{ color:theme.primary }}>→</span>{b}</div>)}
              <div style={{ borderTop:`1px solid ${theme.border}`, marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, color:theme.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>Service Fee</div>
                  <div style={{ fontSize:22, fontWeight:900, color:theme.primary, fontFamily:"'Outfit',sans-serif" }}>£{ex.fee.toFixed(2)}</div>
                </div>
                {ex.note&&<div style={{ fontSize:11, color:theme.green, fontWeight:600, maxWidth:150, textAlign:'right', lineHeight:1.5 }}>💡 {ex.note}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:60 }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <h2 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:18, overflow:'hidden' }}>
            {FAQ.map(([q,a],i)=>(
              <div key={q} className="faq-r" onClick={()=>setExpanded(expanded===`f${i}`?null:`f${i}`)} style={{ padding:'18px 22px', borderBottom:i<FAQ.length-1?`1px solid ${theme.border}`:'none', cursor:'pointer', transition:'background 0.15s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:theme.text }}>{q}</div>
                  <div style={{ fontSize:20, color:theme.muted, flexShrink:0, transition:'transform 0.2s', transform:expanded===`f${i}`?'rotate(45deg)':'none' }}>+</div>
                </div>
                {expanded===`f${i}`&&<div style={{ fontSize:14, color:theme.muted, lineHeight:1.75, marginTop:10, paddingRight:20 }}>{a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:isDark?'linear-gradient(135deg, #0D0720, #1A0F2E)':`linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, borderRadius:22, padding:'clamp(32px,6vw,52px)', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(20px,4vw,32px)', fontWeight:800, color:'#fff', fontFamily:"'Outfit',sans-serif", marginBottom:10 }}>Ready to Book Your First Errand?</h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.8)', marginBottom:28, lineHeight:1.7 }}>Pay only after it's done. No card needed to book.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/book" style={{ textDecoration:'none', background:'#fff', color:theme.primaryDark, padding:'15px 36px', borderRadius:14, fontSize:16, fontWeight:800, fontFamily:"'Outfit',sans-serif" }}>Book a Buddy →</Link>
            <Link to="/apply" style={{ textDecoration:'none', background:'rgba(255,255,255,0.12)', color:'#fff', padding:'15px 28px', borderRadius:14, fontSize:15, fontWeight:700, border:'1.5px solid rgba(255,255,255,0.3)', fontFamily:"'Outfit',sans-serif" }}>Earn as a Buddy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

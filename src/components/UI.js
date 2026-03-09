import { useTheme } from '../contexts/ThemeContext';

export function Card({ children, style={}, onClick }) {
  const { theme: T } = useTheme();
  return (
    <div onClick={onClick} style={{
      background:T.card, border:`1px solid ${T.border}`,
      borderRadius:16, padding:16,
      cursor: onClick ? 'pointer' : 'default',
      transition:'box-shadow 0.2s, transform 0.18s',
      boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
      ...style
    }}
    onMouseEnter={e=>{ if(onClick){ e.currentTarget.style.boxShadow=T.shadow; e.currentTarget.style.transform='translateY(-2px)'; }}}
    onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='none'; }}>
      {children}
    </div>
  );
}

export function Badge({ children, color }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center',
      padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700,
      letterSpacing:0.3, background: color+'22', color,
      border:`1px solid ${color}44`, whiteSpace:'nowrap',
      fontFamily:"'DM Sans',sans-serif" }}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant='primary', size='md', fullWidth, disabled, style={} }) {
  const { theme: T } = useTheme();
  const sizes = {
    sm: { padding:'7px 14px', fontSize:13 },
    md: { padding:'12px 22px', fontSize:14 },
    lg: { padding:'15px 32px', fontSize:16 },
  };
  const variants = {
    primary:   { background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`, color:'#fff', border:'none', boxShadow:`0 4px 16px ${T.primaryHex}44` },
    secondary: { background:T.card2, color:T.text2, border:`1px solid ${T.border}`, boxShadow:'none' },
    ghost:     { background:'transparent', color:T.primary, border:`1px solid ${T.border}`, boxShadow:'none' },
    danger:    { background:T.red, color:'#fff', border:'none', boxShadow:`0 4px 16px ${T.redHex}44` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...sizes[size], ...variants[variant],
      borderRadius:12, fontWeight:700,
      fontFamily:"'DM Sans',sans-serif",
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition:'all 0.18s', display:'inline-flex',
      alignItems:'center', justifyContent:'center', gap:6,
      ...style }}
    onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.opacity='0.88'; }}
    onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.opacity='1'; }}>
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type='text', multiline, rows=3, icon, style={} }) {
  const { theme: T } = useTheme();
  const base = {
    width:'100%', background:T.card2, border:`1.5px solid ${T.border}`,
    borderRadius:10, padding: icon ? '11px 14px 11px 40px' : '11px 14px',
    color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif",
    outline:'none', resize:'vertical', transition:'border-color 0.2s, box-shadow 0.2s',
    ...style,
  };
  return (
    <div style={{ position:'relative' }}>
      {icon && <span style={{ position:'absolute', left:13, top: multiline?13:'50%',
        transform: multiline?'none':'translateY(-50%)', fontSize:16 }}>{icon}</span>}
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder}
            rows={rows} style={base}
            onFocus={e=>{ e.target.style.borderColor=T.primary; e.target.style.boxShadow=`0 0 0 3px ${T.primaryHex}22`; }}
            onBlur={e=>{ e.target.style.borderColor=T.border; e.target.style.boxShadow='none'; }} />
        : <input type={type} value={value} onChange={onChange}
            placeholder={placeholder} style={base}
            onFocus={e=>{ e.target.style.borderColor=T.primary; e.target.style.boxShadow=`0 0 0 3px ${T.primaryHex}22`; }}
            onBlur={e=>{ e.target.style.borderColor=T.border; e.target.style.boxShadow='none'; }} />
      }
    </div>
  );
}

export function Avatar({ emoji, size=40, online }) {
  const { theme: T } = useTheme();
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:'50%',
        background:T.primaryBg, border:`2px solid ${T.border}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:size*0.48 }}>
        {emoji}
      </div>
      {online !== undefined && (
        <div style={{ position:'absolute', bottom:1, right:1,
          width:11, height:11, borderRadius:'50%',
          background: online ? T.green : T.muted,
          border:`2px solid ${T.card}` }} />
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const { theme: T } = useTheme();
  const map = {
    delivered:   { label:'Delivered',  color:T.green },
    in_progress: { label:'Live',       color:T.primary },
    placed:      { label:'Placed',     color:T.accent },
    searching:   { label:'Searching',  color:T.accent },
    accepted:    { label:'Accepted',   color:T.primary },
    cancelled:   { label:'Cancelled',  color:T.red },
  };
  const s = map[status] || { label:status, color:T.muted };
  return <Badge color={s.color}>{status==='in_progress'?'● ':''}{s.label}</Badge>;
}

export function SectionTitle({ children, action }) {
  const { theme: T } = useTheme();
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
      <h2 style={{ fontSize:17, fontWeight:800, color:T.text, fontFamily:"'Syne',sans-serif", margin:0 }}>
        {children}
      </h2>
      {action && <span onClick={action.fn}
        style={{ fontSize:13, color:T.primary, fontWeight:600, cursor:'pointer', opacity:0.85 }}>
        {action.label || action}
      </span>}
    </div>
  );
}

export function Divider({ style={} }) {
  const { theme: T } = useTheme();
  return <div style={{ height:1, background:T.border, margin:'12px 0', ...style }} />;
}

export function Spinner() {
  const { theme: T } = useTheme();
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:32, height:32, borderRadius:'50%',
        border:`3px solid ${T.primaryBg}`,
        borderTop:`3px solid ${T.primary}`,
        animation:'spin 0.8s linear infinite' }} />
    </div>
  );
}

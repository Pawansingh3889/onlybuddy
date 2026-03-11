import { useTheme } from '../contexts/ThemeContext';

export function Card({ children, style = {}, onClick }) {
  const { theme } = useTheme();
  return (
    <div onClick={onClick} style={{
      background: theme.card, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: 16,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.15s',
      ...style
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = theme.shadow; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      background: bg || color + '22',
      color: color,
      border: `1px solid ${color}44`,
    }}>{children}</span>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', fullWidth, disabled, style = {} }) {
  const { theme } = useTheme();
  const sizes = { sm: { padding: '7px 14px', fontSize: 13 }, md: { padding: '12px 24px', fontSize: 15 }, lg: { padding: '15px 32px', fontSize: 16 } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', border: 'none', boxShadow: `0 4px 16px ${theme.primary}44` },
    secondary: { background: theme.card2, color: theme.text2, border: `1px solid ${theme.border}`, boxShadow: 'none' },
    ghost: { background: 'transparent', color: theme.primary, border: `1px solid ${theme.primary}44`, boxShadow: 'none' },
    danger: { background: theme.red, color: '#fff', border: 'none', boxShadow: `0 4px 16px ${theme.red}44` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...sizes[size], ...variants[variant],
      borderRadius: 12, fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition: 'all 0.18s',
      ...style
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type = 'text', multiline, rows = 3, icon, style = {} }) {
  const { theme } = useTheme();
  const base = {
    width: '100%', background: theme.card2,
    border: `1.5px solid ${theme.border}`,
    borderRadius: 12, padding: icon ? '11px 14px 11px 40px' : '11px 14px',
    color: theme.text, fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none', resize: 'vertical', transition: 'border-color 0.2s',
    ...style
  };
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>{icon}</span>}
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base} onFocus={e => e.target.style.borderColor = theme.primary} onBlur={e => e.target.style.borderColor = theme.border} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} onFocus={e => e.target.style.borderColor = theme.primary} onBlur={e => e.target.style.borderColor = theme.border} />
      }
    </div>
  );
}

export function Avatar({ emoji, size = 40, online }) {
  const { theme } = useTheme();
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: theme.primaryBg, border: `2px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.48,
      }}>{emoji}</div>
      {online !== undefined && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: 10, height: 10, borderRadius: '50%',
          background: online ? theme.green : theme.muted,
          border: `2px solid ${theme.card}`,
        }} />
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const { theme } = useTheme();
  const map = {
    delivered:    { label: 'Delivered',    color: theme.green },
    in_progress:  { label: 'Live',         color: theme.primary },
    placed:       { label: 'Placed',       color: theme.accent },
    cancelled:    { label: 'Cancelled',    color: theme.red },
  };
  const s = map[status] || { label: status, color: theme.muted };
  return <Badge color={s.color}>{status === 'in_progress' ? '● ' : ''}{s.label}</Badge>;
}

export function Divider({ style = {} }) {
  const { theme } = useTheme();
  return <div style={{ height: 1, background: theme.border, margin: '12px 0', ...style }} />;
}

export function SectionTitle({ children, action }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: theme.text, fontFamily: "'Syne', sans-serif" }}>{children}</h2>
      {action && <span style={{ fontSize: 13, color: theme.primary, fontWeight: 600, cursor: 'pointer' }}>{action}</span>}
    </div>
  );
}

export function BottomNav({ tabs, active, onSelect }) {
  const { theme } = useTheme();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: theme.navBg, borderTop: `1px solid ${theme.border}`,
      display: 'flex', backdropFilter: 'blur(12px)',
      zIndex: 200, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{
          flex: 1, padding: '10px 4px 12px',
          background: 'none', border: 'none',
          color: active === t.id ? theme.primary : theme.muted,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          cursor: 'pointer', transition: 'color 0.2s',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            {t.badge > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, background: theme.primary, color: '#fff', borderRadius: 10, fontSize: 9, fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{t.badge}</span>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: active === t.id ? 700 : 500 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function TopBar({ title, subtitle, onBack, rightEl, theme }) {
  return (
    <div style={{
      padding: '14px 16px 10px',
      borderBottom: `1px solid ${theme.border}`,
      background: theme.card,
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: theme.bg2, border: 'none', color: theme.text, width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: theme.muted, marginTop: 1 }}>{subtitle}</div>}
          </div>
        </div>
        {rightEl}
      </div>
    </div>
  );
}

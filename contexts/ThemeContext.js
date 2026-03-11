import { createContext, useContext, useState, useEffect } from 'react';

// ── LIGHT MODE — clean white/indigo
const light = {
  bg:          '#F8FAFC',
  bg2:         '#F1F5F9',
  card:        '#FFFFFF',
  card2:       '#F8FAFC',
  navBg:       'rgba(255,255,255,0.94)',
  text:        '#0F172A',
  text2:       '#334155',
  muted:       '#64748B',
  border:      '#E2E8F0',
  primary:     '#6366F1',
  primaryDark: '#4338CA',
  primaryBg:   '#EEF2FF',
  green:       '#059669',
  greenBg:     '#ECFDF5',
  red:         '#DC2626',
  redBg:       '#FEF2F2',
  blue:        '#2563EB',
  accent:      '#F59E0B',
  // Gradients
  heroGradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #8B5CF6 100%)',
  ctaGradient:  'linear-gradient(135deg, #4338CA, #6366F1)',
  btnGradient:  'linear-gradient(135deg, #6366F1, #4338CA)',
};

// ── DARK MODE — deep navy/purple — COMPLETELY different feel
const dark = {
  bg:          '#07090F',
  bg2:         '#0D1117',
  card:        '#0D1117',
  card2:       '#161B22',
  navBg:       'rgba(7,9,15,0.96)',
  text:        '#E6EDF3',
  text2:       '#8B949E',
  muted:       '#484F58',
  border:      '#21262D',
  primary:     '#A78BFA',
  primaryDark: '#7C3AED',
  primaryBg:   '#1A0F2E',
  green:       '#3FB950',
  greenBg:     '#0A1F0D',
  red:         '#F85149',
  redBg:       '#1E0A0A',
  blue:        '#58A6FF',
  accent:      '#E3B341',
  // Gradients — deep dark purple, NOT the same as light
  heroGradient: 'linear-gradient(135deg, #0D0720 0%, #1A0F2E 45%, #2D1B4E 100%)',
  ctaGradient:  'linear-gradient(135deg, #0D0720, #1A0F2E)',
  btnGradient:  'linear-gradient(135deg, #7C3AED, #5B21B6)',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('ob-theme');
      if (saved) return saved === 'dark';
    } catch {}
    return false;
  });

  const theme = isDark ? dark : light;

  useEffect(() => {
    try { localStorage.setItem('ob-theme', isDark ? 'dark' : 'light'); } catch {}
    document.body.style.background = theme.bg;
    document.body.style.color      = theme.text;
    // ← Also change meta theme-color so phone browser chrome matches
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#07090F' : '#6366F1');
  }, [isDark, theme.bg, theme.text]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

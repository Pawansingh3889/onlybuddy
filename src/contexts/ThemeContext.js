import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    bg:'#F8F7FF', bg2:'#EFECFD', card:'#FFFFFF', card2:'#F9F8FF',
    border:'#E4E0F5', borderStrong:'#C9C3E8',
    text:'#1A1035', text2:'#3D3465', muted:'#8B84A8',
    primary:'#6D28D9', primaryLight:'#8B5CF6', primaryDark:'#5B21B6',
    primaryBg:'#EDE9FE', primaryHex:'#6D28D9',
    accent:'#F59E0B', accentBg:'#FFFBEB',
    green:'#059669', greenBg:'#ECFDF5', greenHex:'#059669',
    red:'#DC2626', redBg:'#FEF2F2', redHex:'#DC2626',
    shadow:'0 6px 24px rgba(109,40,217,0.12)',
    shadowSm:'0 2px 8px rgba(109,40,217,0.08)',
    navBg:'rgba(255,255,255,0.94)',
  },
  dark: {
    bg:'#0C0A18', bg2:'#13102A', card:'#191629', card2:'#211D34',
    border:'#2C2750', borderStrong:'#3D3870',
    text:'#EDE9FF', text2:'#C5BFDF', muted:'#6E6890',
    primary:'#8B5CF6', primaryLight:'#A78BFA', primaryDark:'#7C3AED',
    primaryBg:'#1E1633', primaryHex:'#8B5CF6',
    accent:'#FBBF24', accentBg:'#1C1505',
    green:'#10B981', greenBg:'#052E1C', greenHex:'#10B981',
    red:'#F87171', redBg:'#1F0A0A', redHex:'#F87171',
    shadow:'0 6px 24px rgba(0,0,0,0.4)',
    shadowSm:'0 2px 8px rgba(0,0,0,0.3)',
    navBg:'rgba(25,22,41,0.96)',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('ob_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });

  const theme = isDark ? themes.dark : themes.light;

  useEffect(() => {
    try { localStorage.setItem('ob_theme', isDark ? 'dark' : 'light'); } catch {}
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.background = theme.bg;
    document.body.style.color      = theme.text;
  }, [isDark, theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

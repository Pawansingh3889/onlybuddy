import { createContext, useContext, useState, useEffect } from 'react';

const light = {
  bg:'#F8FAFC', bg2:'#F1F5F9', card:'#FFFFFF', card2:'#F8FAFC',
  navBg:'rgba(255,255,255,0.92)', text:'#0F172A', text2:'#334155', muted:'#64748B',
  border:'#E2E8F0', primary:'#6366F1', primaryDark:'#4338CA', primaryBg:'#EEF2FF',
  green:'#059669', greenBg:'#ECFDF5', red:'#DC2626', redBg:'#FEF2F2',
  blue:'#2563EB', accent:'#F59E0B',
};
const dark = {
  bg:'#0A0F1E', bg2:'#111827', card:'#131C2E', card2:'#1E293B',
  navBg:'rgba(13,20,40,0.94)', text:'#F1F5F9', text2:'#CBD5E1', muted:'#64748B',
  border:'#1E293B', primary:'#818CF8', primaryDark:'#6366F1', primaryBg:'#1E1B4B',
  green:'#34D399', greenBg:'#022C22', red:'#F87171', redBg:'#2D0A0A',
  blue:'#60A5FA', accent:'#FCD34D',
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
    document.body.style.color = theme.text;
  }, [isDark, theme.bg, theme.text]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

import { createContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { useContext } from 'react';
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const initializeTheme = async () => {
      const savedTheme = await getStorage('theme');
      const theme = savedTheme || 'light'; // Default to light if nothing is saved
      const newIsDark = theme === 'dark';
      setIsDark(newIsDark);
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    initializeTheme();
  }, []);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    await setStorage('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};



export const useTheme = () => useContext(ThemeContext);

import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Hook for managing theme (dark/light mode)
 */
export const useTheme = () => {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);

  // Sync theme with document on mount and changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [theme]);

  // Check system preference on initial load
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Only set from system if no saved preference
    const savedTheme = localStorage.getItem('crypto-vs-birr-settings');
    if (!savedTheme) {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    // Listen for system theme changes
    const handler = (e) => {
      // Only auto-switch if user hasn't manually set a preference recently
      // This is optional - could be removed if you want manual control only
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
};

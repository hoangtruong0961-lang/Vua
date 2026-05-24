import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbService } from '../services/db/indexedDB';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  visualEffects: boolean;
  setVisualEffects: (enabled: boolean) => void;
  interfaceMode: 'auto' | 'pc' | 'mobile';
  setInterfaceMode: (mode: 'auto' | 'pc' | 'mobile') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontFamily, setFontFamilyState] = useState<string>('Inter');
  const [fontSize, setFontSizeState] = useState<number>(16);
  const [visualEffects, setVisualEffectsState] = useState<boolean>(true);
  const [interfaceMode, setInterfaceModeState] = useState<'auto' | 'pc' | 'mobile'>('auto');
  const [resolvedInterfaceMode, setResolvedInterfaceMode] = useState<'pc' | 'mobile'>('pc');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await dbService.getSettings();
      setThemeState(settings.theme || 'dark');
      setFontFamilyState(settings.systemFont || 'Inter');
      setFontSizeState(settings.fontSize || 16);
      setVisualEffectsState(settings.visualEffects !== undefined ? settings.visualEffects : true);
      setInterfaceModeState(settings.interfaceMode || 'auto');
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--font-system', fontFamily);
    root.style.setProperty('--font-size-base', `${fontSize}px`);
  }, [fontFamily, fontSize]);

  useEffect(() => {
    const updateResolvedMode = () => {
      if (interfaceMode === 'auto') {
        const isMobileDevice = typeof window !== 'undefined' && (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 1024);
        setResolvedInterfaceMode(isMobileDevice ? 'mobile' : 'pc');
      } else {
        setResolvedInterfaceMode(interfaceMode);
      }
    };

    updateResolvedMode();

    if (interfaceMode === 'auto') {
      window.addEventListener('resize', updateResolvedMode);
      return () => window.removeEventListener('resize', updateResolvedMode);
    }
  }, [interfaceMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    const scale = resolvedInterfaceMode === 'mobile' ? 0.7 : 1.0;
    
    // Check if 'zoom' is natively supported (Chrome, Safari, Edge, etc.)
    const isZoomSupported = 'zoom' in root.style;
    
    if (isZoomSupported) {
      root.style.zoom = scale.toString();
      // Back out of transform fallbacks
      root.style.transform = '';
      root.style.transformOrigin = '';
      root.style.width = '';
      root.style.height = '';
    } else {
      // Fallback for Firefox using standard transform scale
      if (scale === 0.7) {
        root.style.transform = 'scale(0.7)';
        root.style.transformOrigin = 'top left';
        root.style.width = '142.857%';
        root.style.height = '142.857%';
      } else {
        root.style.transform = '';
        root.style.transformOrigin = '';
        root.style.width = '';
        root.style.height = '';
      }
    }
  }, [resolvedInterfaceMode]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setFontFamily = (font: string) => {
    setFontFamilyState(font);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
  };

  const setVisualEffects = (enabled: boolean) => {
    setVisualEffectsState(enabled);
  };

  const setInterfaceMode = (mode: 'auto' | 'pc' | 'mobile') => {
    setInterfaceModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, toggleTheme, setTheme, 
      fontFamily, setFontFamily, 
      fontSize, setFontSize,
      visualEffects, setVisualEffects,
      interfaceMode, setInterfaceMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

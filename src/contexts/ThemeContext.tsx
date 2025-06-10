'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

export type ThemeMode = 'light' | 'dark';
export type CSSStyle = 'default' | 'modern' | 'classic' | 'minimal' | 'vibrant';

interface ThemeContextType {
  themeMode: ThemeMode;
  cssStyle: CSSStyle;
  setThemeMode: (mode: ThemeMode) => void;
  setCSSStyle: (style: CSSStyle) => void;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// CSS style configurations
const cssStyles: Record<CSSStyle, any> = {
  default: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  modern: {
    colorPrimary: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  classic: {
    colorPrimary: '#003a8c',
    colorSuccess: '#389e0d',
    colorWarning: '#d48806',
    colorError: '#cf1322',
    borderRadius: 4,
    fontFamily: 'Times New Roman, serif',
  },
  minimal: {
    colorPrimary: '#000000',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    borderRadius: 2,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  vibrant: {
    colorPrimary: '#ff4d4f',
    colorSuccess: '#00d9ff',
    colorWarning: '#ff7a00',
    colorError: '#ff4d4f',
    borderRadius: 16,
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [cssStyle, setCSSStyleState] = useState<CSSStyle>('default');

  // Load theme settings from localStorage on mount
  useEffect(() => {
    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode;
    const savedCSSStyle = localStorage.getItem('cssStyle') as CSSStyle;
    
    if (savedThemeMode && ['light', 'dark'].includes(savedThemeMode)) {
      setThemeModeState(savedThemeMode);
    }
    
    if (savedCSSStyle && Object.keys(cssStyles).includes(savedCSSStyle)) {
      setCSSStyleState(savedCSSStyle);
    }
  }, []);

  // Apply CSS style class to body
  useEffect(() => {
    document.body.className = `theme-${themeMode} style-${cssStyle}`;
  }, [themeMode, cssStyle]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
  };

  const setCSSStyle = (style: CSSStyle) => {
    setCSSStyleState(style);
    localStorage.setItem('cssStyle', style);
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const antdTheme = {
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: cssStyles[cssStyle],
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      cssStyle,
      setThemeMode,
      setCSSStyle,
      toggleThemeMode,
    }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
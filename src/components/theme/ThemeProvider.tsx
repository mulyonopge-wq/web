'use client';

import React, { createContext, useContext, useEffect } from 'react';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  buttonStyle: string;
  layout: string;
  headerStyle: string;
}

const ThemeContext = createContext<ThemeConfig | null>(null);

export function useTheme() {
  return useContext(ThemeContext);
}

// Map Tailwind rounded class to CSS radius value
function getRadiusValue(radiusClass: string): string {
  switch (radiusClass) {
    case 'rounded-none':
      return '0px';
    case 'rounded-sm':
      return '0.125rem';
    case 'rounded-md':
      return '0.375rem';
    case 'rounded-lg':
      return '0.5rem';
    case 'rounded-xl':
      return '0.75rem';
    case 'rounded-2xl':
      return '1rem';
    case 'rounded-full':
      return '9999px';
    default:
      return '0.5rem';
  }
}

// Adjust hex color brightness for hover states
function adjustBrightness(col: string, percent: number): string {
  if (!col || !col.startsWith('#')) return col;
  const num = parseInt(col.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeConfig;
  children: React.ReactNode;
}) {
  const primaryHover = adjustBrightness(theme.primaryColor, -15);
  const radiusVal = getRadiusValue(theme.borderRadius);

  // Apply CSS variables dynamically to root document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-primary-hover', primaryHover);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-bg', theme.backgroundColor);
    root.style.setProperty('--theme-text', theme.textColor);
    root.style.setProperty('--theme-radius', radiusVal);
    root.style.setProperty('--theme-font-heading', `'${theme.headingFont}', sans-serif`);
    root.style.setProperty('--theme-font-body', `'${theme.bodyFont}', sans-serif`);
  }, [theme, primaryHover, radiusVal]);

  const cssStyle = `
    :root {
      --theme-primary: ${theme.primaryColor} !important;
      --theme-primary-hover: ${primaryHover} !important;
      --theme-secondary: ${theme.secondaryColor} !important;
      --theme-accent: ${theme.accentColor} !important;
      --theme-bg: ${theme.backgroundColor} !important;
      --theme-text: ${theme.textColor} !important;
      --theme-radius: ${radiusVal} !important;
      --theme-font-heading: '${theme.headingFont}', sans-serif !important;
      --theme-font-body: '${theme.bodyFont}', sans-serif !important;
    }
  `;

  return (
    <ThemeContext.Provider value={theme}>
      <style dangerouslySetInnerHTML={{ __html: cssStyle }} />
      {children}
    </ThemeContext.Provider>
  );
}

import { createTamagui, createTokens } from '@tamagui/core';
import { config as configBase } from '@tamagui/config/v3';

const tokens = createTokens({
  color: {
    bg: '#FFFFFF', 
    fg: '#111827', 
    brand: '#0A5C3B', 
    brandActive: '#0E754B',
    accent: '#31B276', 
    border: '#E5E7EB', 
    muted: '#6B7280', 
    error: '#B91C1C', 
    card: '#FFFFFF'
  },
  radius: { 0: 0, 1: 8, 2: 16 },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 },
  size: { 1: 14, 2: 16, 3: 18, 4: 20, 5: 24 }
});

const config = createTamagui({
  ...configBase,
  tokens,
  themes: { 
    light: { 
      bg: tokens.color.bg, 
      color: tokens.color.fg, 
      borderColor: tokens.color.border, 
      brand: tokens.color.brand, 
      brandActive: tokens.color.brandActive,
      card: tokens.color.card,
      muted: tokens.color.muted
    } 
  },
  fonts: {
    body: { 
      family: 'Poppins', 
      size: { 1: 14, 2: 16, 3: 18, 4: 20, 5: 24 }, 
      weight: { 4: '400', 5: '500', 6: '600', 7: '700' } 
    },
    heading: { 
      family: 'Poppins', 
      size: { 1: 18, 2: 20, 3: 24, 4: 28 }, 
      weight: { 6: '600', 7: '700' } 
    }
  }
});

export default config;
export type AppConfig = typeof config;
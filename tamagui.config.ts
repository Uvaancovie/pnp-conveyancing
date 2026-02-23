import { config as configBase } from '@tamagui/config/v3';
import { createTamagui, createTokens } from '@tamagui/core';

const tokens = createTokens({
  color: {
    bg: '#FFFFFF', 
    background: '#F9FAFB',
    fg: '#111827', 
    brand: '#0A5C3B', 
    brandActive: '#0E754B',
    brandLight: '#E8F5E9',
    brandLightHover: '#D1E7DD',
    accent: '#31B276', 
    border: '#E5E7EB', 
    borderColorHover: '#D1D5DB',
    borderColorFocus: '#E5E7EB',
    outlineColor: 'transparent',
    muted: '#6B7280', 
    error: '#B91C1C', 
    card: '#FFFFFF',
    true: '#0A5C3B',
  },
  radius: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 8 },
  space: { 0: 0, 1: 3, 2: 6, 3: 10, 4: 14, 5: 20, 6: 28, true: 14 },
  size: { 0: 0, 1: 15, 2: 17, 3: 19, 4: 22, 5: 26, 6: 30, 7: 34, true: 17 }
});

const config = createTamagui({
  ...configBase,
  tokens,
  themes: { 
    light: { 
      bg: tokens.color.bg, 
      background: tokens.color.background,
      color: tokens.color.fg, 
      borderColor: tokens.color.border, 
      borderColorHover: tokens.color.borderColorHover,
      borderColorFocus: tokens.color.borderColorFocus,
      outlineColor: tokens.color.outlineColor,
      brand: tokens.color.brand, 
      brandActive: tokens.color.brandActive,
      brandLight: tokens.color.brandLight,
      brandLightHover: tokens.color.brandLightHover,
      card: tokens.color.card,
      muted: tokens.color.muted
    } 
  },
  fonts: {
    body: { 
      family: 'Poppins_400Regular', 
      size: { 1: 15, 2: 17, 3: 19, 4: 22, 5: 26, true: 17 }, 
      lineHeight: { 1: 20, 2: 22, 3: 24, 4: 28, 5: 32, true: 22 },
      weight: { 4: '400', 5: '500', 6: '600', 7: '700', true: '400' },
      face: {
        400: { normal: 'Poppins_400Regular' },
        500: { normal: 'Poppins_500Medium' },
        600: { normal: 'Poppins_600SemiBold' },
        700: { normal: 'Poppins_700Bold' }
      }
    },
    heading: { 
      family: 'Poppins_700Bold', 
      size: { 1: 20, 2: 22, 3: 26, 4: 30, 5: 34, 6: 38, 7: 42, true: 26 }, 
      lineHeight: { 1: 24, 2: 26, 3: 30, 4: 34, 5: 38, 6: 42, 7: 46, true: 30 },
      weight: { 6: '600', 7: '700', true: '700' },
      face: {
        600: { normal: 'Poppins_600SemiBold' },
        700: { normal: 'Poppins_700Bold' }
      }
    }
  }
});

export default config;
export type AppConfig = typeof config;
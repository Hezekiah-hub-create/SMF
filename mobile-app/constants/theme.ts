/**
 * Theme configuration for cross-platform support (iOS & Android)
 * Provides consistent styling across both platforms
 */

import { Platform, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Detect device type
const isTablet = Math.min(width, height) >= 600;
const isSmallPhone = Math.min(width, height) < 360;

// Color palette
export const Colors = {
  light: {
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#F0F4FF',
    card: '#FFFFFF',
    tint: '#4169E1',
    tintLight: '#EEF2FF',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#4169E1',
    border: '#E2E8F0',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0F172A',
    card: '#1E293B',
    tint: '#4169E1',
    tintLight: '#312E81',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#4169E1',
    border: '#334155',
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#78350F',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    info: '#3B82F6',
    infoLight: '#1E3A8A',
  },
};

// Primary brand colors
export const BrandColors = {
  primary: '#4169E1',
  primaryDark: '#2D4DB8',
  primaryLight: '#EEF2FF',
  secondary: '#7C3AED',
  secondaryLight: '#F5F3FF',
  accent: '#EC4899',
  accentLight: '#FDF2F8',
};

// Base font sizes - responsive
const baseFontScale = isSmallPhone ? 0.9 : isTablet ? 1.1 : 1;

export const Fonts = {
  // System fonts that work on both platforms
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  // Fallback for web
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  // Get the appropriate font family based on platform
  getFont: (type: 'sans' | 'serif' | 'mono' = 'sans') => {
    if (Platform.OS === 'ios') {
      return Fonts.ios[type];
    }
    if (Platform.OS === 'android') {
      return Fonts.android[type];
    }
    return Fonts.web[type];
  },
};

// Font sizes with responsive scaling
export const FontSizes = {
  xs: Math.round(10 * baseFontScale),
  sm: Math.round(12 * baseFontScale),
  base: Math.round(14 * baseFontScale),
  md: Math.round(15 * baseFontScale),
  lg: Math.round(16 * baseFontScale),
  xl: Math.round(18 * baseFontScale),
  xxl: Math.round(20 * baseFontScale),
  xxxl: Math.round(24 * baseFontScale),
  title: Math.round(28 * baseFontScale),
  hero: Math.round(32 * baseFontScale),
};

// Spacing scale - responsive
const spacingScale = isSmallPhone ? 0.85 : isTablet ? 1.2 : 1;

export const Spacing = {
  xs: Math.round(4 * spacingScale),
  sm: Math.round(8 * spacingScale),
  md: Math.round(12 * spacingScale),
  lg: Math.round(16 * spacingScale),
  xl: Math.round(20 * spacingScale),
  xxl: Math.round(24 * spacingScale),
  xxxl: Math.round(32 * spacingScale),
};

// Border radius scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
};

// Shadow styles for both platforms
export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
};

// Common styles
export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textPrimary: {
    color: Colors.light.text,
    fontSize: FontSizes.base,
  },
  textSecondary: {
    color: Colors.light.textSecondary,
    fontSize: FontSizes.sm,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.base,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});

// Screen dimensions export
export const ScreenDimensions = {
  width,
  height,
  isPortrait: height > width,
  isLandscape: width > height,
  isTablet,
  isSmallPhone,
};

export default {
  Colors,
  BrandColors,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
  CommonStyles,
  ScreenDimensions,
};

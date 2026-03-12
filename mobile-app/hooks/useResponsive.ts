/**
 * Responsive design hook for cross-platform support
 * Provides utilities for adapting UI to different screen sizes
 */

import { useMemo } from 'react';
import { Dimensions, Platform, useWindowDimensions, ScrollView, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Common device sizes
export const DEVICE = {
  // Standard iPhone sizes
  iphoneSE: { width: 320, height: 568 },
  iphone8: { width: 375, height: 667 },
  iphonePlus: { width: 414, height: 736 },
  iphoneX: { width: 375, height: 812 },
  iphoneXR: { width: 414, height: 896 },
  iphone12Mini: { width: 360, height: 780 },
  iphone14: { width: 390, height: 844 },
  iphone14ProMax: { width: 430, height: 932 },
  
  // Common Android sizes
  androidSmall: { width: 320, height: 480 },
  androidMedium: { width: 360, height: 640 },
  androidLarge: { width: 360, height: 800 },
  androidXL: { width: 412, height: 890 },
};

// Device type detection
export const useDeviceType = () => {
  const { width, height } = useWindowDimensions();
  
  return useMemo(() => {
    const isTablet = Math.min(width, height) >= 600;
    const isSmallPhone = Math.min(width, height) < 360;
    const isLargePhone = Math.max(width, height) >= 850;
    const isLandscape = width > height;
    
    return {
      isTablet,
      isSmallPhone,
      isLargePhone,
      isLandscape,
      isAndroid: Platform.OS === 'android',
      isIOS: Platform.OS === 'ios',
      width,
      height,
      orientation: isLandscape ? 'landscape' : 'portrait',
    };
  }, [width, height]);
};

// Responsive scale functions
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  
  const scale = useMemo(() => {
    const baseWidth = 375; // iPhone X base
    return width / baseWidth;
  }, [width]);
  
  const verticalScale = useMemo(() => {
    const baseHeight = 812; // iPhone X base
    return height / baseHeight;
  }, [height]);
  
  // Moderate scale for text and small elements
  const moderateScale = useMemo(() => {
    return (size: number) => {
      const newSize = size * scale;
      // Don't scale down too much on small phones
      if (scale < 1) {
        return size - (1 - scale) * size * 0.3;
      }
      return newSize;
    };
  }, [scale]);
  
  // Spacing based on screen size
  const spacing = useMemo(() => ({
    xs: Math.max(4, 4 * scale),
    sm: Math.max(8, 8 * scale),
    md: Math.max(12, 12 * scale),
    lg: Math.max(16, 16 * scale),
    xl: Math.max(20, 20 * scale),
    xxl: Math.max(24, 24 * scale),
    xxxl: Math.max(32, 32 * scale),
  }), [scale]);
  
  // Font sizes
  const fontSize = useMemo(() => ({
    xs: Math.max(10, 10 * scale),
    sm: Math.max(12, 12 * scale),
    base: Math.max(14, 14 * scale),
    md: Math.max(15, 15 * scale),
    lg: Math.max(16, 16 * scale),
    xl: Math.max(18, 18 * scale),
    xxl: Math.max(20, 20 * scale),
    xxxl: Math.max(24, 24 * scale),
    title: Math.max(28, 28 * scale),
  }), [scale]);
  
  // Border radius
  const borderRadius = useMemo(() => ({
    sm: Math.max(4, 4 * scale),
    md: Math.max(8, 8 * scale),
    lg: Math.max(12, 12 * scale),
    xl: Math.max(16, 16 * scale),
    xxl: Math.max(20, 20 * scale),
    full: 9999,
  }), [scale]);
  
  return {
    scale,
    verticalScale,
    moderateScale,
    spacing,
    fontSize,
    borderRadius,
    width,
    height,
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
    isPortrait: height > width,
    isLandscape: width > height,
  };
};

// Platform-specific helpers
export const PlatformSelect = <T,>(options: {
  ios?: T;
  android?: T;
  default?: T;
}): T => {
  return Platform.select(options) as T;
};

// Safe area helpers for notch handling
export const useSafeAreaInsets = () => {
  const { width, height } = useWindowDimensions();
  
  // Approximate safe area insets based on device
  return useMemo(() => {
    const isNotched = Platform.OS === 'ios' && (height >= 812 || width >= 812);
    const isAndroidNotched = Platform.OS === 'android' && height >= 800;
    
    if (Platform.OS === 'ios') {
      // Approximate iOS safe areas
      if (height >= 932) return { top: 59, right: 0, bottom: 34, left: 0 }; // iPhone 14 Pro Max
      if (height >= 844) return { top: 47, right: 0, bottom: 34, left: 0 }; // iPhone 14
      if (height >= 896) return { top: 44, right: 0, bottom: 34, left: 0 }; // iPhone XR
      if (height >= 812) return { top: 44, right: 0, bottom: 34, left: 0 }; // iPhone X
      return { top: 20, right: 0, bottom: 0, left: 0 }; // Older iPhones
    }
    
    // Android - typically less safe area issues
    if (height >= 890) return { top: 40, right: 0, bottom: 32, left: 0 };
    if (height >= 800) return { top: 32, right: 0, bottom: 24, left: 0 };
    return { top: 24, right: 0, bottom: 0, left: 0 };
  }, [height, width]);
};

export default useResponsive;

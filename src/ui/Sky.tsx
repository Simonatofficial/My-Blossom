import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Sky — the back layer: the theme's gradient + a soft horizon haze for depth.
 * The full visual engine (atmospheres · weather · particles · the flower) layers
 * over this via a transparent WebView on native + canvas on web (docs/07, ported
 * from The Blossom's Canvas2D engine). This gradient is the always-on floor.
 */
export function Sky({ children }: { children?: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.sky} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['transparent', theme.haze]}
        style={[StyleSheet.absoluteFill, { top: '55%', opacity: 0.5 }]}
      />
      {children}
    </View>
  );
}

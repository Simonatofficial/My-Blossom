import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * ToastProvider — a soft, transient confirmation banner (the `ctx.toast` Tools
 * already call). Calm by default: it fades in low on the screen, holds briefly,
 * fades out. One at a time; a new toast replaces the current. Mounted inside the
 * theme so it picks up the active biome's surface/text.
 */
const Ctx = createContext<{ toast: (msg: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme, withAlpha } = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback(
    (m: string) => {
      if (!m) return;
      setMsg(m);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(({ finished }) => {
          if (finished) setMsg(null);
        });
      }, 1800);
    },
    [opacity],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {msg != null ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity,
              bottom: insets.bottom + 96,
              backgroundColor: withAlpha(theme.surface, 0.96),
              borderColor: withAlpha(theme.accent, 0.4),
              transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            },
          ]}
        >
          <Text style={{ color: theme.text, fontWeight: '600' }}>{msg}</Text>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

export function useToast(): { toast: (msg: string) => void } {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used within ToastProvider');
  return v;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
});

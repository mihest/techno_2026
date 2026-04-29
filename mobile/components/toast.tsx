import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { neon } from '@/constants/neon';

type ToastType = 'success' | 'error' | 'info';

let pushToast: ((type: ToastType, message: string) => void) | null = null;

export function showToast(type: ToastType, message: string) {
  pushToast?.(type, message);
}

export function ToastHost() {
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  useEffect(() => {
    pushToast = (type, message) => setToast({ type, message });
    return () => {
      pushToast = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  if (!toast) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.toast,
        toast.type === 'success' ? styles.success : toast.type === 'error' ? styles.error : styles.info,
      ]}>
      <Text style={styles.text}>{toast.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    zIndex: 9999,
  },
  success: { backgroundColor: 'rgba(128,255,2,0.15)', borderColor: neon.green },
  error: { backgroundColor: 'rgba(237,28,36,0.15)', borderColor: neon.red },
  info: { backgroundColor: 'rgba(0,211,244,0.15)', borderColor: neon.cyan },
  text: { color: neon.textPrimary, fontWeight: '700' },
});

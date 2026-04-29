import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastHost } from '@/components/toast';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="create-quest" options={{ title: 'Создание квеста' }} />
        <Stack.Screen name="team" options={{ title: 'Команда' }} />
        <Stack.Screen name="quest/[id]" options={{ title: 'Детали квеста' }} />
        <Stack.Screen name="quest/[id]/play" options={{ title: 'Прохождение квеста' }} />
      </Stack>
      <ToastHost />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

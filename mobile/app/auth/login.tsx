import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { neon } from '@/constants/neon';
import { signIn } from '@/lib/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    setError('');
    try {
      await signIn(username.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={neon.textSecondary} style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={neon.textSecondary} style={styles.input} secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.btn} onPress={onLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Входим...' : 'Войти'}</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/register')}>
        <Text style={styles.link}>Нет аккаунта? Регистрация</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neon.bgDark, padding: 16, justifyContent: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '800', color: neon.yellow, marginBottom: 8 },
  input: { backgroundColor: neon.bgCard, borderWidth: 1, borderColor: neon.border, borderRadius: 14, color: neon.textPrimary, paddingHorizontal: 14, paddingVertical: 12 },
  btn: { backgroundColor: neon.red, borderRadius: 20, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: neon.cyan, textAlign: 'center', marginTop: 10 },
  error: { color: neon.red },
});

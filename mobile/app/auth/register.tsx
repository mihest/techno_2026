import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { neon } from '@/constants/neon';
import { signUp } from '@/lib/api';

const defaultAgeGroupId = '5705a746-c2fc-4cbe-98d2-a9e5c076f89b';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRegister() {
    setLoading(true);
    setError('');
    try {
      await signUp(username.trim(), nickname.trim() || username.trim(), defaultAgeGroupId, password, confirm);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={neon.textSecondary} style={styles.input} />
      <TextInput value={nickname} onChangeText={setNickname} placeholder="Nickname" placeholderTextColor={neon.textSecondary} style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={neon.textSecondary} style={styles.input} secureTextEntry />
      <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirm password" placeholderTextColor={neon.textSecondary} style={styles.input} secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.btn} onPress={onRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Создаем...' : 'Создать аккаунт'}</Text>
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
  error: { color: neon.red },
});

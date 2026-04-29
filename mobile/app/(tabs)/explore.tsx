import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { neon } from '@/constants/neon';
import { signOut } from '@/lib/api';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>IP</Text>
      </View>
      <Text style={styles.name}>Imprezzio User</Text>
      <Text style={styles.meta}>Возрастная группа: 15-16</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Статистика</Text>
        <Text style={styles.cardMeta}>Пройдено квестов: 0</Text>
        <Text style={styles.cardMeta}>Создано квестов: 0</Text>
        <Text style={styles.cardMeta}>Очков: 0</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => router.push('/create-quest')}>
          <Text style={styles.btnText}>Создать квест</Text>
        </Pressable>
        <Pressable style={styles.btnOutline} onPress={() => router.push('/team')}>
          <Text style={styles.btnOutlineText}>Команда</Text>
        </Pressable>
        <Pressable
          style={styles.btnOutline}
          onPress={async () => {
            await signOut();
            router.replace('/auth/login');
          }}>
          <Text style={styles.btnOutlineText}>Выйти</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neon.bgDark, padding: 16, alignItems: 'center', gap: 10 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: neon.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  avatarText: { color: '#111', fontSize: 28, fontWeight: '800' },
  name: { color: neon.textPrimary, fontSize: 24, fontWeight: '800' },
  meta: { color: neon.textSecondary },
  card: { marginTop: 8, width: '100%', backgroundColor: neon.bgCard, borderRadius: 16, borderWidth: 1, borderColor: neon.border, padding: 16, gap: 6 },
  cardTitle: { color: neon.yellow, fontWeight: '800', fontSize: 18 },
  cardMeta: { color: neon.textSecondary },
  actions: { width: '100%', gap: 8 },
  btn: { backgroundColor: neon.red, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnOutline: { borderColor: neon.yellow, borderWidth: 1.5, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  btnOutlineText: { color: neon.yellow, fontWeight: '700' },
});

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { neon } from '@/constants/neon';
import { createTeam, getTeam, joinTeam, TeamResponse } from '@/lib/api';

export default function TeamScreen() {
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');

  async function reload() {
    setLoading(true);
    setMessage('');
    try {
      const result = await getTeam();
      setTeam(result);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Не удалось загрузить команду');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function onCreate() {
    try {
      await createTeam(createName.trim());
      setCreateName('');
      setMessage('Команда создана');
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Ошибка создания команды');
    }
  }

  async function onJoin() {
    try {
      await joinTeam(joinCode.trim());
      setJoinCode('');
      setMessage('Вы вступили в команду');
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Ошибка вступления');
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Команда</Text>
      {!!message && <Text style={styles.note}>{message}</Text>}
      {team ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{team.name}</Text>
          <Text style={styles.cardMeta}>Код приглашения: {team.join_code || '—'}</Text>
          <Text style={styles.cardMeta}>Участников: {team.team_members?.length || 0}</Text>
        </View>
      ) : (
        <Text style={styles.cardMeta}>Команда не найдена</Text>
      )}

      <View style={styles.form}>
        <Text style={styles.section}>Создать команду</Text>
        <TextInput value={createName} onChangeText={setCreateName} placeholder="Название команды" placeholderTextColor={neon.textSecondary} style={styles.input} />
        <Pressable style={styles.btn} onPress={onCreate}><Text style={styles.btnText}>Создать</Text></Pressable>
      </View>

      <View style={styles.form}>
        <Text style={styles.section}>Вступить в команду</Text>
        <TextInput value={joinCode} onChangeText={setJoinCode} placeholder="Код приглашения" placeholderTextColor={neon.textSecondary} style={styles.input} />
        <Pressable style={styles.btn} onPress={onJoin}><Text style={styles.btnText}>Вступить</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neon.bgDark, padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: neon.bgDark },
  title: { color: neon.yellow, fontWeight: '800', fontSize: 30 },
  note: { color: neon.cyan },
  card: { backgroundColor: neon.bgCard, borderColor: neon.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardTitle: { color: neon.textPrimary, fontWeight: '700', fontSize: 18 },
  cardMeta: { color: neon.textSecondary },
  form: { backgroundColor: neon.bgCard, borderColor: neon.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  section: { color: neon.yellow, fontWeight: '700' },
  input: { backgroundColor: neon.bgDark, borderColor: neon.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: neon.textPrimary },
  btn: { alignSelf: 'flex-start', backgroundColor: neon.red, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  btnText: { color: '#fff', fontWeight: '700' },
});

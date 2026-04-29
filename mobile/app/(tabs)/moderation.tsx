import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { fetchQuests, QuestDetails } from '@/lib/api';
import { neon } from '@/constants/neon';

const statuses = ['На модерации', 'Опубликовано', 'Скрыто'] as const;

export default function ModerationScreen() {
  const [quests, setQuests] = useState<QuestDetails[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('На модерации');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchQuests(status)
      .then((data) => setQuests(data.items || []))
      .catch((e) => setError(e.message || 'Не удалось загрузить очередь модерации'))
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = quests.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${item.title || ''} ${item.author_id || ''}`.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Загружаем квесты...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={filtered}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Модерация</Text>
          <View style={styles.tabs}>
            {statuses.map((s) => (
              <Pressable key={s} style={[styles.tab, status === s && styles.tabActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.tabText, status === s && styles.tabTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Поиск"
            placeholderTextColor={neon.textSecondary}
            style={styles.searchInput}
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title || 'Без названия'}</Text>
          <Text style={styles.meta}>Статус: {item.status || 'На модерации'}</Text>
          <Pressable style={styles.btn} onPress={() => router.push(`/quest/${item.id}`)}>
            <Text style={styles.btnText}>Открыть</Text>
          </Pressable>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.muted}>Квестов на модерации нет</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: neon.bgDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  header: { gap: 10 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 4, color: neon.yellow },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: neon.border, backgroundColor: neon.bgCard },
  tabActive: { borderColor: neon.yellow },
  tabText: { color: neon.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: neon.yellow },
  searchInput: {
    backgroundColor: neon.bgCard,
    borderColor: neon.border,
    borderWidth: 1,
    borderRadius: 22,
    color: neon.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: { backgroundColor: neon.bgCard, borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: neon.border },
  cardTitle: { color: neon.textPrimary, fontSize: 17, fontWeight: '700' },
  meta: { color: neon.textSecondary, fontSize: 13 },
  btn: { alignSelf: 'flex-start', backgroundColor: neon.red, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  btnText: { color: '#fff', fontWeight: '700' },
  muted: { color: neon.textSecondary },
  error: { color: neon.red, textAlign: 'center', paddingHorizontal: 20 },
});

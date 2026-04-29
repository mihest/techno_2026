import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { fetchQuests, QuestDetails } from '@/lib/api';
import { neon } from '@/constants/neon';

export default function QuestsScreen() {
  const [quests, setQuests] = useState<QuestDetails[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuests()
      .then((data) => {
        setQuests(data.items || []);
      })
      .catch((e) => {
        setError(e.message || 'Не удалось загрузить квесты');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = quests.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${item.title || ''} ${item.city_district || ''} ${item.category || ''}`.toLowerCase().includes(q);
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
        <Text style={styles.error}>Ошибка: {error}</Text>
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
          <Text style={styles.title}>Квесты</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Поиск по названию, району, категории"
            placeholderTextColor={neon.textSecondary}
            style={styles.searchInput}
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title || 'Без названия'}</Text>
          <Text style={styles.meta}>{item.city_district || 'Локация не указана'}</Text>
          <Text style={styles.meta}>Сложность: {item.difficulty || 0}/5 • {item.duration_minutes || 0} мин</Text>
          <View style={styles.row}>
            <Pressable style={styles.primaryBtn} onPress={() => router.push(`/quest/${item.id}`)}>
              <Text style={styles.primaryBtnText}>Детали</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => router.push(`/quest/${item.id}/play`)}>
              <Text style={styles.secondaryBtnText}>Играть</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: neon.bgDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  header: { gap: 10, marginBottom: 4 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 4, color: neon.yellow },
  searchInput: {
    backgroundColor: neon.bgCard,
    borderColor: neon.border,
    borderWidth: 1,
    borderRadius: 22,
    color: neon.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: { backgroundColor: neon.bgCard, borderRadius: 18, padding: 16, gap: 6, borderWidth: 1, borderColor: neon.border },
  cardTitle: { color: neon.textPrimary, fontSize: 18, fontWeight: '700' },
  meta: { color: neon.textSecondary, fontSize: 13 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primaryBtn: { backgroundColor: neon.red, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { borderWidth: 1.5, borderColor: neon.yellow, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryBtnText: { color: neon.yellow, fontWeight: '700' },
  muted: { color: neon.textSecondary },
  error: { color: neon.red, paddingHorizontal: 20, textAlign: 'center' },
});

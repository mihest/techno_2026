import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { fetchQuestById, QuestDetails, sendModerationDecision } from '@/lib/api';
import { neon } from '@/constants/neon';
import { showToast } from '@/components/toast';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quest, setQuest] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchQuestById(id)
      .then(setQuest)
      .catch((e) => setError(e.message || 'Не удалось загрузить квест'))
      .finally(() => setLoading(false));
  }, [id]);

  async function decision(action: 'publish' | 'reject') {
    if (!quest) return;
    if (action === 'reject' && rejectReason.trim().length < 10) {
      setError('Причина отклонения должна быть не короче 10 символов');
      return;
    }
    setWorking(true);
    try {
      await sendModerationDecision(quest.id, action, action === 'reject' ? rejectReason.trim() : '');
      const updated = await fetchQuestById(quest.id);
      setQuest(updated);
      if (action === 'reject') setRejectReason('');
      showToast('success', action === 'publish' ? 'Квест опубликован' : 'Квест отклонен');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка действия модерации');
      showToast('error', e instanceof Error ? e.message : 'Ошибка действия модерации');
    } finally {
      setWorking(false);
    }
  }

  function parseRulesWarning(raw: string) {
    const result: { rules: string; warnings: string; whatToTake: string } = {
      rules: '',
      warnings: '',
      whatToTake: '',
    };
    raw?.split('\n').forEach((line) => {
      const [key, ...rest] = line.split(':');
      const text = rest.join(':').trim();
      const k = key?.trim().toLowerCase();
      if (!text) return;
      if (k === 'rules' || k === 'rule') result.rules = text;
      if (k === 'warning' || k === 'warnings') result.warnings = text;
      if (k === 'what to take') result.whatToTake = text;
    });
    return result;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !quest) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Квест не найден'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{quest.title || 'Без названия'}</Text>
      <Text style={styles.meta}>{quest.city_district || 'Локация не указана'}</Text>
      <Text style={styles.meta}>Статус: {quest.status}</Text>
      <Text style={styles.description}>{quest.description || 'Описание не указано'}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Правила</Text>
        <Text style={styles.infoText}>{parseRulesWarning(quest.rules_warning || '').rules || 'Не указаны'}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Предупреждения</Text>
        <Text style={styles.infoText}>{parseRulesWarning(quest.rules_warning || '').warnings || 'Не указаны'}</Text>
      </View>
      <Text style={styles.subtitle}>Чекпоинты ({quest.checkpoints?.length || 0})</Text>
      {!!quest.checkpoints?.length && Number.isFinite(quest.checkpoints[0].lat) && Number.isFinite(quest.checkpoints[0].lng) && (
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: quest.checkpoints[0].lat,
              longitude: quest.checkpoints[0].lng,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}>
            {quest.checkpoints.map((cp) => (
              <Marker
                key={`marker-${cp.id}`}
                coordinate={{ latitude: cp.lat, longitude: cp.lng }}
                title={`${cp.order}. ${cp.title}`}
                description={cp.task}
              />
            ))}
          </MapView>
        </View>
      )}

      {(quest.checkpoints || []).map((cp) => (
        <View key={`${cp.id}-${cp.order}`} style={styles.card}>
          <Text style={styles.cardTitle}>{cp.order}. {cp.title}</Text>
          <Text style={styles.cardText}>{cp.task}</Text>
          <Text style={styles.cardMeta}>Тип: {cp.question_type}</Text>
        </View>
      ))}

      <View style={styles.row}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push(`/quest/${quest.id}/play`)}>
          <Text style={styles.primaryText}>Начать квест</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable disabled={working} style={styles.successBtn} onPress={() => decision('publish')}>
          <Text style={styles.primaryText}>Одобрить</Text>
        </Pressable>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Причина отклонения</Text>
        <TextInput
          value={rejectReason}
          onChangeText={setRejectReason}
          placeholder="Укажите причину (минимум 10 символов)"
          placeholderTextColor={neon.textSecondary}
          style={styles.input}
          multiline
        />
        <Pressable disabled={working} style={styles.rejectBtn} onPress={() => decision('reject')}>
          <Text style={styles.primaryText}>Отклонить</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, backgroundColor: neon.bgDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: neon.yellow },
  subtitle: { fontSize: 20, fontWeight: '700', marginTop: 8, color: neon.textPrimary },
  meta: { color: neon.textSecondary },
  description: { color: neon.textPrimary, marginBottom: 4 },
  infoCard: { backgroundColor: neon.bgCard, borderRadius: 14, padding: 12, borderColor: neon.border, borderWidth: 1, gap: 4 },
  infoTitle: { color: neon.yellow, fontWeight: '700' },
  infoText: { color: neon.textSecondary },
  card: { backgroundColor: neon.bgCard, borderRadius: 12, padding: 12, gap: 6, borderColor: neon.border, borderWidth: 1 },
  cardTitle: { color: neon.textPrimary, fontWeight: '700' },
  cardText: { color: neon.textSecondary },
  cardMeta: { color: neon.textSecondary, fontSize: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  mapWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: neon.border },
  map: { width: '100%', height: 220 },
  input: {
    backgroundColor: neon.bgDark,
    borderColor: neon.border,
    borderWidth: 1,
    borderRadius: 12,
    color: neon.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  primaryBtn: { backgroundColor: neon.red, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  successBtn: { backgroundColor: neon.green, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  rejectBtn: { backgroundColor: neon.red, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  primaryText: { color: '#fff', fontWeight: '700' },
  error: { color: neon.red, textAlign: 'center', paddingHorizontal: 20 },
});

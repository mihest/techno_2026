import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { fetchQuestById, QuestCheckpoint, QuestDetails } from '@/lib/api';
import { neon } from '@/constants/neon';
import { showToast } from '@/components/toast';

export default function QuestPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quest, setQuest] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchQuestById(id)
      .then(setQuest)
      .catch((e) => setError(e.message || 'Не удалось загрузить квест'))
      .finally(() => setLoading(false));
  }, [id]);

  const currentCheckpoint = useMemo<QuestCheckpoint | null>(() => {
    if (!quest?.checkpoints?.length) return null;
    return quest.checkpoints[checkpointIndex] || null;
  }, [quest, checkpointIndex]);

  function submitAnswer() {
    if (!currentCheckpoint) return;
    const sorted = [...(currentCheckpoint.answers || [])].sort((a, b) => (a.option_order || 0) - (b.option_order || 0));
    const reward = Math.max(0, 50 - hintsUsed * 10);
    let correct = false;

    if ((currentCheckpoint.question_type || 'code') === 'choice' || sorted.length > 1) {
      if (selectedOption === null) {
        setMessage('Выберите вариант ответа');
        return;
      }
      correct = !!sorted[selectedOption]?.is_correct;
    } else {
      const normalized = answer.trim().toLowerCase();
      const validAnswers = sorted
        .filter((a) => a.is_correct)
        .map((a) => (a.answer_text || '').trim().toLowerCase());
      if (!normalized) {
        setMessage('Введите ответ');
        return;
      }
      correct = validAnswers.includes(normalized);
    }

    if (correct) {
      setPoints((p) => p + reward);
      setMessage(`Верно! +${reward}`);
      showToast('success', `Верно! +${reward}`);
    } else {
      setMessage('Неверно');
      showToast('error', 'Неверный ответ');
    }

    setAnswer('');
    setSelectedOption(null);
    setHintsUsed(0);
    setTimeout(() => {
      setMessage('');
      setCheckpointIndex((prev) => prev + 1);
    }, 500);
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

  if (!currentCheckpoint) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Квест завершен</Text>
        <Text style={styles.points}>Итоговые очки: {points}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{quest.title}</Text>
      <Text style={styles.meta}>
        Чекпоинт {checkpointIndex + 1} из {quest.checkpoints.length}
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{currentCheckpoint.title}</Text>
        <Text style={styles.cardText}>{currentCheckpoint.task}</Text>
        {Number.isFinite(currentCheckpoint.lat) && Number.isFinite(currentCheckpoint.lng) && (
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentCheckpoint.lat,
                longitude: currentCheckpoint.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}>
              <Marker coordinate={{ latitude: currentCheckpoint.lat, longitude: currentCheckpoint.lng }} />
            </MapView>
          </View>
        )}
        {(currentCheckpoint.hints || []).slice(0, 3).map((hint, idx) => (
          <Pressable
            key={`${currentCheckpoint.id}-hint-${idx}`}
            style={styles.hintChip}
            onPress={() => {
              if (hintsUsed >= idx + 1) return;
              setHintsUsed(idx + 1);
              setMessage(`Подсказка: ${hint}`);
              showToast('info', `Подсказка ${idx + 1}: ${hint}`);
            }}>
            <Text style={styles.hintChipText}>Подсказка {idx + 1}</Text>
          </Pressable>
        ))}
      </View>
      {((currentCheckpoint.question_type || 'code') === 'choice' || (currentCheckpoint.answers || []).length > 1) ? (
        <View style={styles.options}>
          {[...(currentCheckpoint.answers || [])]
            .sort((a, b) => (a.option_order || 0) - (b.option_order || 0))
            .map((option, idx) => (
              <Pressable
                key={`${option.id}-${idx}`}
                style={[styles.optionBtn, selectedOption === idx && styles.optionBtnActive]}
                onPress={() => setSelectedOption(idx)}>
                <Text style={styles.optionText}>{option.answer_text}</Text>
              </Pressable>
            ))}
        </View>
      ) : (
        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Введите ответ"
          placeholderTextColor={neon.textSecondary}
        />
      )}
      <Pressable style={styles.btn} onPress={submitAnswer}>
        <Text style={styles.btnText}>Проверить</Text>
      </Pressable>
      {!!message && <Text style={styles.message}>{message}</Text>}
      <Text style={styles.points}>Очки: {points}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: neon.bgDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 26, fontWeight: '800', color: neon.yellow },
  meta: { color: neon.textSecondary },
  card: { backgroundColor: neon.bgCard, borderRadius: 12, padding: 12, gap: 8, borderColor: neon.border, borderWidth: 1 },
  cardTitle: { color: neon.textPrimary, fontWeight: '700', fontSize: 17 },
  cardText: { color: neon.textSecondary },
  mapWrap: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: neon.border },
  map: { width: '100%', height: 180 },
  hintChip: { borderWidth: 1, borderColor: neon.cyan, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
  hintChipText: { color: neon.cyan, fontSize: 12, fontWeight: '700' },
  options: { gap: 8 },
  optionBtn: { backgroundColor: neon.bgCard, borderColor: neon.border, borderWidth: 1, borderRadius: 12, padding: 12 },
  optionBtnActive: { borderColor: neon.yellow, backgroundColor: '#2b1c3f' },
  optionText: { color: neon.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: neon.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: neon.textPrimary,
    backgroundColor: neon.bgCard,
  },
  btn: { backgroundColor: neon.red, borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  message: { color: neon.textPrimary, fontWeight: '700' },
  points: { color: neon.yellow, fontWeight: '700' },
  error: { color: neon.red, textAlign: 'center', paddingHorizontal: 20 },
});

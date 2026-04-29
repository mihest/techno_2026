import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { neon } from '@/constants/neon';
import { createQuest } from '@/lib/api';

type DraftCheckpoint = {
  title: string;
  task: string;
  question_type: 'code' | 'choice';
  answer: string;
  options: string[];
  correctOption: number;
  hints: string[];
  address: string;
};

export default function CreateQuestScreen() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [rules, setRules] = useState('');
  const [warnings, setWarnings] = useState('');
  const [whatToTake, setWhatToTake] = useState('');
  const [difficulty, setDifficulty] = useState('3');
  const [duration, setDuration] = useState('60');
  const [checkpointTitle, setCheckpointTitle] = useState('');
  const [checkpointTask, setCheckpointTask] = useState('');
  const [checkpointType, setCheckpointType] = useState<'code' | 'choice'>('code');
  const [checkpointAnswer, setCheckpointAnswer] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('1');
  const [checkpointAddress, setCheckpointAddress] = useState('');
  const [checkpointHint1, setCheckpointHint1] = useState('');
  const [checkpointHint2, setCheckpointHint2] = useState('');
  const [checkpointHint3, setCheckpointHint3] = useState('');
  const [checkpoints, setCheckpoints] = useState<DraftCheckpoint[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function validateStep(nextStep: number) {
    if (nextStep === 2) {
      if (!title.trim()) return 'Заполните название квеста';
      if (description.trim().length < 30) return 'Описание должно быть минимум 30 символов';
      if (!cityDistrict.trim()) return 'Укажите район/город';
    }
    if (nextStep === 3) {
      if (checkpoints.length < 3) return 'Добавьте минимум 3 чекпоинта';
    }
    return '';
  }

  function addCheckpoint() {
    if (!checkpointTitle.trim() || !checkpointTask.trim()) {
      setMessage('Заполните название и задание чекпоинта');
      return;
    }
    if (checkpointType === 'code' && !checkpointAnswer.trim()) {
      setMessage('Для типа "code" укажите правильный ответ');
      return;
    }
    const options = [option1.trim(), option2.trim(), option3.trim(), option4.trim()];
    if (checkpointType === 'choice' && options.some((opt) => !opt)) {
      setMessage('Для типа "choice" заполните все 4 варианта ответа');
      return;
    }

    const cp: DraftCheckpoint = {
      title: checkpointTitle.trim(),
      task: checkpointTask.trim(),
      question_type: checkpointType,
      answer: checkpointAnswer.trim(),
      options,
      correctOption: Math.max(1, Math.min(4, Number(correctOption) || 1)),
      hints: [checkpointHint1.trim(), checkpointHint2.trim(), checkpointHint3.trim()].filter(Boolean),
      address: checkpointAddress.trim(),
    };

    if (editingIndex !== null) {
      setCheckpoints((prev) => prev.map((item, idx) => (idx === editingIndex ? cp : item)));
      setMessage('Чекпоинт обновлен');
    } else {
      setCheckpoints((prev) => [...prev, cp]);
      setMessage('Чекпоинт добавлен');
    }

    setCheckpointTitle('');
    setCheckpointTask('');
    setCheckpointType('code');
    setCheckpointAnswer('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOption('1');
    setCheckpointAddress('');
    setCheckpointHint1('');
    setCheckpointHint2('');
    setCheckpointHint3('');
    setEditingIndex(null);
  }

  function editCheckpoint(index: number) {
    const cp = checkpoints[index];
    setEditingIndex(index);
    setCheckpointTitle(cp.title);
    setCheckpointTask(cp.task);
    setCheckpointType(cp.question_type);
    setCheckpointAnswer(cp.answer);
    setOption1(cp.options[0] || '');
    setOption2(cp.options[1] || '');
    setOption3(cp.options[2] || '');
    setOption4(cp.options[3] || '');
    setCorrectOption(String(cp.correctOption || 1));
    setCheckpointAddress(cp.address);
    setCheckpointHint1(cp.hints[0] || '');
    setCheckpointHint2(cp.hints[1] || '');
    setCheckpointHint3(cp.hints[2] || '');
    setMessage('Режим редактирования чекпоинта');
  }

  async function onSubmit() {
    setLoading(true);
    setMessage('');
    try {
      await createQuest({
        title,
        description,
        city_district: cityDistrict,
        difficulty: Number(difficulty),
        duration_minutes: Number(duration),
        rules_warning: `rules: ${rules}\nwarnings: ${warnings}\nwhat to take: ${whatToTake}`,
        category: category || undefined,
        checkpoints: checkpoints.map((cp, index) => ({
          order: index + 1,
          title: cp.title,
          task: cp.task,
          question_type: cp.question_type,
          address: cp.address || cityDistrict,
          lat: 55.751244 + index * 0.0005,
          lng: 37.618423 + index * 0.0005,
          hints: cp.hints,
          point_rules: rules || 'Соблюдайте правила безопасности',
          answer_options:
            cp.question_type === 'choice'
              ? cp.options.map((option, optionIndex) => ({
                  option_order: optionIndex + 1,
                  answer_text: option,
                  is_correct: optionIndex + 1 === cp.correctOption,
                }))
              : [{ option_order: 1, answer_text: cp.answer, is_correct: true }],
        })),
      });
      setMessage('Квест отправлен на модерацию');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Ошибка создания квеста');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Создание квеста</Text>
      {!!message && <Text style={styles.note}>{message}</Text>}
      <View style={styles.stepRow}>
        {[1, 2, 3].map((n) => (
          <Pressable key={n} style={[styles.stepChip, step === n && styles.stepChipActive]} onPress={() => setStep(n)}>
            <Text style={[styles.stepChipText, step === n && styles.stepChipTextActive]}>Шаг {n}</Text>
          </Pressable>
        ))}
      </View>

      {step === 1 && (
        <View style={styles.block}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Название" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Описание (мин. 30 символов)" placeholderTextColor={neon.textSecondary} style={styles.input} multiline />
          <TextInput value={cityDistrict} onChangeText={setCityDistrict} placeholder="Район/город" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={category} onChangeText={setCategory} placeholder="Категория" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={difficulty} onChangeText={setDifficulty} placeholder="Сложность 1-5" placeholderTextColor={neon.textSecondary} style={styles.input} keyboardType="numeric" />
          <TextInput value={duration} onChangeText={setDuration} placeholder="Длительность минут" placeholderTextColor={neon.textSecondary} style={styles.input} keyboardType="numeric" />
          <Pressable
            style={styles.btn}
            onPress={() => {
              const err = validateStep(2);
              if (err) return setMessage(err);
              setStep(2);
              setMessage('');
            }}>
            <Text style={styles.btnText}>Далее</Text>
          </Pressable>
        </View>
      )}

      {step === 2 && (
        <View style={styles.block}>
          <TextInput value={rules} onChangeText={setRules} placeholder="Правила" placeholderTextColor={neon.textSecondary} style={styles.input} multiline />
          <TextInput value={warnings} onChangeText={setWarnings} placeholder="Предупреждения" placeholderTextColor={neon.textSecondary} style={styles.input} multiline />
          <TextInput value={whatToTake} onChangeText={setWhatToTake} placeholder="Что взять с собой" placeholderTextColor={neon.textSecondary} style={styles.input} multiline />
          <Text style={styles.section}>Чекпоинты ({checkpoints.length})</Text>
          <TextInput value={checkpointTitle} onChangeText={setCheckpointTitle} placeholder="Название чекпоинта" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={checkpointTask} onChangeText={setCheckpointTask} placeholder="Задание" placeholderTextColor={neon.textSecondary} style={styles.input} multiline />
          <View style={styles.row}>
            <Pressable style={[styles.typeChip, checkpointType === 'code' && styles.typeChipActive]} onPress={() => setCheckpointType('code')}>
              <Text style={[styles.typeText, checkpointType === 'code' && styles.typeTextActive]}>code</Text>
            </Pressable>
            <Pressable style={[styles.typeChip, checkpointType === 'choice' && styles.typeChipActive]} onPress={() => setCheckpointType('choice')}>
              <Text style={[styles.typeText, checkpointType === 'choice' && styles.typeTextActive]}>choice</Text>
            </Pressable>
          </View>
          {checkpointType === 'code' ? (
            <TextInput value={checkpointAnswer} onChangeText={setCheckpointAnswer} placeholder="Правильный ответ (code)" placeholderTextColor={neon.textSecondary} style={styles.input} />
          ) : (
            <View style={styles.block}>
              <TextInput value={option1} onChangeText={setOption1} placeholder="Вариант 1" placeholderTextColor={neon.textSecondary} style={styles.input} />
              <TextInput value={option2} onChangeText={setOption2} placeholder="Вариант 2" placeholderTextColor={neon.textSecondary} style={styles.input} />
              <TextInput value={option3} onChangeText={setOption3} placeholder="Вариант 3" placeholderTextColor={neon.textSecondary} style={styles.input} />
              <TextInput value={option4} onChangeText={setOption4} placeholder="Вариант 4" placeholderTextColor={neon.textSecondary} style={styles.input} />
              <TextInput
                value={correctOption}
                onChangeText={setCorrectOption}
                placeholder="Номер правильного варианта (1-4)"
                placeholderTextColor={neon.textSecondary}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          )}
          <TextInput value={checkpointAddress} onChangeText={setCheckpointAddress} placeholder="Адрес" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={checkpointHint1} onChangeText={setCheckpointHint1} placeholder="Подсказка 1" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={checkpointHint2} onChangeText={setCheckpointHint2} placeholder="Подсказка 2" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <TextInput value={checkpointHint3} onChangeText={setCheckpointHint3} placeholder="Подсказка 3" placeholderTextColor={neon.textSecondary} style={styles.input} />
          <Pressable style={styles.btnOutline} onPress={addCheckpoint}>
            <Text style={styles.btnOutlineText}>{editingIndex !== null ? 'Сохранить чекпоинт' : 'Добавить чекпоинт'}</Text>
          </Pressable>
          {checkpoints.map((cp, idx) => (
            <View key={`${cp.title}-${idx}`} style={styles.checkpointCard}>
              <Text style={styles.checkpointTitle}>{idx + 1}. {cp.title}</Text>
              <Text style={styles.checkpointMeta}>{cp.task}</Text>
              <Text style={styles.checkpointMeta}>Тип: {cp.question_type}</Text>
              <View style={styles.row}>
                <Pressable onPress={() => editCheckpoint(idx)}>
                  <Text style={styles.editText}>Редактировать</Text>
                </Pressable>
                <Pressable onPress={() => setCheckpoints((prev) => prev.filter((_, i) => i !== idx))}>
                  <Text style={styles.deleteText}>Удалить</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <View style={styles.row}>
            <Pressable style={styles.btnOutline} onPress={() => setStep(1)}>
              <Text style={styles.btnOutlineText}>Назад</Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={() => {
                const err = validateStep(3);
                if (err) return setMessage(err);
                setStep(3);
                setMessage('');
              }}>
              <Text style={styles.btnText}>Далее</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.block}>
          <Text style={styles.previewTitle}>Предпросмотр</Text>
          <Text style={styles.previewText}>Название: {title}</Text>
          <Text style={styles.previewText}>Локация: {cityDistrict}</Text>
          <Text style={styles.previewText}>Сложность: {difficulty}</Text>
          <Text style={styles.previewText}>Длительность: {duration} мин</Text>
          <Text style={styles.previewText}>Чекпоинтов: {checkpoints.length}</Text>
          <View style={styles.row}>
            <Pressable style={styles.btnOutline} onPress={() => setStep(2)}>
              <Text style={styles.btnOutlineText}>Назад</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Отправка...' : 'Отправить'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: neon.bgDark, padding: 16, gap: 10 },
  title: { color: neon.yellow, fontWeight: '800', fontSize: 30, marginBottom: 6 },
  note: { color: neon.cyan },
  block: { gap: 10 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  stepChip: { borderColor: neon.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: neon.bgCard },
  stepChipActive: { borderColor: neon.yellow },
  stepChipText: { color: neon.textSecondary, fontWeight: '700', fontSize: 12 },
  stepChipTextActive: { color: neon.yellow },
  section: { color: neon.yellow, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  typeChip: { borderColor: neon.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: neon.bgCard },
  typeChipActive: { borderColor: neon.yellow },
  typeText: { color: neon.textSecondary, fontWeight: '700' },
  typeTextActive: { color: neon.yellow },
  input: { backgroundColor: neon.bgCard, borderColor: neon.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, color: neon.textPrimary },
  btn: { alignSelf: 'flex-start', backgroundColor: neon.red, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnOutline: { alignSelf: 'flex-start', borderColor: neon.yellow, borderWidth: 1.5, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, marginTop: 8 },
  btnOutlineText: { color: neon.yellow, fontWeight: '700' },
  checkpointCard: { borderColor: neon.border, borderWidth: 1, borderRadius: 12, backgroundColor: neon.bgCard, padding: 10, gap: 4 },
  checkpointTitle: { color: neon.textPrimary, fontWeight: '700' },
  checkpointMeta: { color: neon.textSecondary, fontSize: 12 },
  editText: { color: neon.cyan, fontWeight: '700', marginTop: 4 },
  deleteText: { color: neon.red, fontWeight: '700', marginTop: 4 },
  previewTitle: { color: neon.yellow, fontWeight: '800', fontSize: 20 },
  previewText: { color: neon.textSecondary },
});

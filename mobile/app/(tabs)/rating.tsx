import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { neon } from '@/constants/neon';

const teams = [
  { rank: 1, name: 'Неоновые следопыты', points: 1420 },
  { rank: 2, name: 'Арбат Team', points: 1285 },
  { rank: 3, name: 'Городские коты', points: 1190 },
];

const solo = [
  { rank: 1, name: 'mihest', points: 980 },
  { rank: 2, name: 'anna_quest', points: 930 },
  { rank: 3, name: 'nightwalker', points: 910 },
];

export default function RatingScreen() {
  const [tab, setTab] = useState<'teams' | 'solo'>('teams');
  const list = tab === 'teams' ? teams : solo;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Рейтинг</Text>
      <View style={styles.tabRow}>
        <Pressable style={[styles.tabBtn, tab === 'teams' && styles.tabBtnActive]} onPress={() => setTab('teams')}>
          <Text style={[styles.tabText, tab === 'teams' && styles.tabTextActive]}>Команды</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, tab === 'solo' && styles.tabBtnActive]} onPress={() => setTab('solo')}>
          <Text style={[styles.tabText, tab === 'solo' && styles.tabTextActive]}>Игроки</Text>
        </Pressable>
      </View>
      {list.map((item) => (
        <View key={`${tab}-${item.rank}-${item.name}`} style={styles.row}>
          <Text style={styles.rank}>#{item.rank}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.points}>{item.points}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: neon.bgDark, padding: 16, gap: 10 },
  title: { color: neon.yellow, fontSize: 30, fontWeight: '800' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tabBtn: { borderWidth: 1, borderColor: neon.border, backgroundColor: neon.bgCard, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  tabBtnActive: { borderColor: neon.yellow },
  tabText: { color: neon.textSecondary, fontWeight: '700' },
  tabTextActive: { color: neon.yellow },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: neon.bgCard, borderColor: neon.border, borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  rank: { color: neon.yellow, fontWeight: '800', width: 40 },
  name: { color: neon.textPrimary, flex: 1, fontWeight: '700' },
  points: { color: neon.green, fontWeight: '800' },
});

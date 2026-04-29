import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getSessionToken, hydrateSession } from '@/lib/api';
import { neon } from '@/constants/neon';

export default function EntryScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateSession().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: neon.bgDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={getSessionToken() ? '/(tabs)' : '/auth/login'} />;
}

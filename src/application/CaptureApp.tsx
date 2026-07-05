import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CaptureDetailsScreen } from '../screens/CaptureDetailsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { supabase } from '../services/supabaseClient';
import { VoiceCapture } from '../types/capture';

export function CaptureApp() {
  const [captures, setCaptures] = useState<VoiceCapture[]>([]);
  const [selectedCaptureId, setSelectedCaptureId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const selectedCapture = captures.find((capture) => capture.id === selectedCaptureId) ?? null;

  const handleCapturesChange = useCallback((nextCaptures: VoiceCapture[]) => {
    setCaptures(nextCaptures);
  }, []);

  const handleCaptureUpdated = (updatedCapture: VoiceCapture) => {
    setCaptures((currentCaptures) =>
      currentCaptures.map((capture) => (capture.id === updatedCapture.id ? updatedCapture : capture)),
    );
  };

  const handleCaptureDeleted = (id: string) => {
    setCaptures((currentCaptures) => currentCaptures.filter((capture) => capture.id !== id));
    setSelectedCaptureId(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoadingSession(false);

      if (!nextSession) {
        setSelectedCaptureId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoadingSession) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#176B5B" />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (selectedCapture) {
    return (
      <CaptureDetailsScreen
        capture={selectedCapture}
        onBack={() => setSelectedCaptureId(null)}
        onCaptureDeleted={handleCaptureDeleted}
        onCaptureUpdated={handleCaptureUpdated}
      />
    );
  }

  return (
    <HomeScreen
      captures={captures}
      onCapturesChange={handleCapturesChange}
      onSignOut={signOut}
      onOpenCapture={(capture) => setSelectedCaptureId(capture.id)}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#F7FAF9',
    flex: 1,
    justifyContent: 'center',
  },
});

import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CaptureCard } from '../components/CaptureCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { createCapture, listCaptures } from '../storage/captureStorage';
import { VoiceCapture } from '../types/capture';
import { formatDuration } from '../utils/format';

type HomeScreenProps = {
  captures: VoiceCapture[];
  onCapturesChange: (captures: VoiceCapture[]) => void;
  onOpenCapture: (capture: VoiceCapture) => void;
};

type ActiveRecording = {
  startedAt: number;
  targetDurationSeconds?: number;
};

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document' as const,
};

const QUICK_RECORDINGS = [
  { label: 'Gravar 5 min', seconds: 5 * 60 },
  { label: 'Gravar 15 min', seconds: 15 * 60 },
  { label: 'Gravar 30 min', seconds: 30 * 60 },
];

export function HomeScreen({ captures, onCapturesChange, onOpenCapture }: HomeScreenProps) {
  const audioRecorder = useAudioRecorder(RECORDING_OPTIONS);
  const [activeRecording, setActiveRecording] = useState<ActiveRecording | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const stopInProgressRef = useRef(false);

  const remainingSeconds = useMemo(() => {
    if (!activeRecording?.targetDurationSeconds) {
      return null;
    }

    return Math.max(activeRecording.targetDurationSeconds - elapsedSeconds, 0);
  }, [activeRecording, elapsedSeconds]);

  const refreshCaptures = useCallback(async () => {
    const nextCaptures = await listCaptures();
    onCapturesChange(nextCaptures);
  }, [onCapturesChange]);

  const startRecording = async (targetDurationSeconds?: number) => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permissao necessaria', 'Autorize o microfone para gravar capturas.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync(RECORDING_OPTIONS);
      audioRecorder.record();
      setElapsedSeconds(0);
      setActiveRecording({
        startedAt: Date.now(),
        targetDurationSeconds,
      });
    } catch (error) {
      Alert.alert('Erro ao iniciar gravacao', getErrorMessage(error));
    }
  };

  const stopRecording = useCallback(async () => {
    if (!activeRecording || stopInProgressRef.current) {
      return;
    }

    stopInProgressRef.current = true;

    try {
      await audioRecorder.stop();
      const durationSeconds = Math.max(1, Math.round((Date.now() - activeRecording.startedAt) / 1000));
      const fileUri = audioRecorder.uri;

      if (!fileUri) {
        throw new Error('A gravacao terminou sem URI de arquivo.');
      }

      await createCapture({
        durationSeconds,
        fileUri,
        targetDurationSeconds: activeRecording.targetDurationSeconds,
      });
      await refreshCaptures();
      setActiveRecording(null);
      setElapsedSeconds(0);
    } catch (error) {
      Alert.alert('Erro ao parar gravacao', getErrorMessage(error));
    } finally {
      stopInProgressRef.current = false;
    }
  }, [activeRecording, audioRecorder, refreshCaptures]);

  useEffect(() => {
    refreshCaptures();
  }, [refreshCaptures]);

  useEffect(() => {
    if (!activeRecording) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - activeRecording.startedAt) / 1000));
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeRecording]);

  useEffect(() => {
    if (activeRecording?.targetDurationSeconds && elapsedSeconds >= activeRecording.targetDurationSeconds) {
      stopRecording();
    }
  }, [activeRecording, elapsedSeconds, stopRecording]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCaptures();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={captures}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => <CaptureCard capture={item} onPress={() => onOpenCapture(item)} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Vozetiv Capture</Text>
              <Text style={styles.subtitle}>Captura de Voz para ideias, tarefas e observacoes do Hub.</Text>
            </View>

            <View style={styles.recorderPanel}>
              {activeRecording ? (
                <>
                  <Text style={styles.recordingLabel}>
                    {remainingSeconds === null ? 'Gravacao livre' : 'Gravacao com limite'}
                  </Text>
                  <Text style={styles.timer}>
                    {formatDuration(remainingSeconds === null ? elapsedSeconds : remainingSeconds)}
                  </Text>
                  <PrimaryButton label="Parar gravacao" onPress={stopRecording} variant="danger" />
                </>
              ) : (
                <>
                  <Text style={styles.panelTitle}>Gravacao rapida</Text>
                  <View style={styles.quickGrid}>
                    {QUICK_RECORDINGS.map((item) => (
                      <PrimaryButton
                        key={item.seconds}
                        label={item.label}
                        onPress={() => startRecording(item.seconds)}
                        style={styles.quickButton}
                      />
                    ))}
                    <PrimaryButton
                      label="Gravacao livre"
                      onPress={() => startRecording()}
                      variant="secondary"
                      style={styles.quickButton}
                    />
                  </View>
                </>
              )}
            </View>

            <Text style={styles.sectionTitle}>Capturas recentes</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma captura local ainda.</Text>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Tente novamente.';
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAF9',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    gap: 18,
  },
  title: {
    color: '#10201D',
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: '#52615E',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  recorderPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE5E2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  panelTitle: {
    color: '#152320',
    fontSize: 18,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickButton: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  recordingLabel: {
    color: '#52615E',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timer: {
    color: '#10201D',
    fontSize: 54,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#152320',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 6,
  },
  empty: {
    color: '#64726F',
    fontSize: 15,
    paddingVertical: 20,
    textAlign: 'center',
  },
  separator: {
    height: 12,
  },
});

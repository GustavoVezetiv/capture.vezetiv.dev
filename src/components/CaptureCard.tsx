import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VoiceCapture } from '../types/capture';
import { formatDateTime, formatDuration, formatStatus } from '../utils/format';

type CaptureCardProps = {
  capture: VoiceCapture;
  onPress: () => void;
};

export function CaptureCard({ capture, onPress }: CaptureCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDateTime(capture.createdAt)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{formatStatus(capture.status)}</Text>
        </View>
      </View>
      <Text style={styles.duration}>{formatDuration(capture.durationSeconds)}</Text>
      <Text style={styles.detail}>Abrir detalhes</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7E5',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  date: {
    color: '#465551',
    flex: 1,
    fontSize: 13,
  },
  badge: {
    backgroundColor: '#E8EFED',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#176B5B',
    fontSize: 12,
    fontWeight: '800',
  },
  duration: {
    color: '#152320',
    fontSize: 26,
    fontWeight: '800',
  },
  detail: {
    color: '#176B5B',
    fontSize: 13,
    fontWeight: '700',
  },
});

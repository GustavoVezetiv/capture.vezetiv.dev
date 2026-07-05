import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '../utils/format';
import { PrimaryButton } from './PrimaryButton';

type AudioPlayerProps = {
  uri: string;
};

export function AudioPlayer({ uri }: AudioPlayerProps) {
  const player = useAudioPlayer(uri, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }

    if (status.didJustFinish || status.currentTime >= status.duration) {
      player.seekTo(0);
    }

    player.play();
  };

  const replay = () => {
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.time}>
          {formatDuration(status.currentTime)} / {formatDuration(status.duration)}
        </Text>
        <Text style={styles.state}>{status.playing ? 'Reproduzindo' : 'Pronto para ouvir'}</Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label={status.playing ? 'Pausar' : 'Ouvir'}
          onPress={togglePlayback}
          style={styles.action}
        />
        <PrimaryButton label="Reiniciar" onPress={replay} variant="secondary" style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F6',
    borderRadius: 8,
    gap: 14,
    padding: 14,
  },
  time: {
    color: '#152320',
    fontSize: 22,
    fontWeight: '800',
  },
  state: {
    color: '#5B6966',
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
});

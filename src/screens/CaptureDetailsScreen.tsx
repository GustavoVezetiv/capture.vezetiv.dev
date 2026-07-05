import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AudioPlayer } from '../components/AudioPlayer';
import { PrimaryButton } from '../components/PrimaryButton';
import { uploadVoiceCapture } from '../services/hubApi';
import { deleteCapture, updateCapture } from '../storage/captureStorage';
import { VoiceCapture } from '../types/capture';
import { formatDateTime, formatDuration, formatStatus } from '../utils/format';

type CaptureDetailsScreenProps = {
  capture: VoiceCapture;
  onBack: () => void;
  onCaptureDeleted: (id: string) => void;
  onCaptureUpdated: (capture: VoiceCapture) => void;
};

export function CaptureDetailsScreen({
  capture,
  onBack,
  onCaptureDeleted,
  onCaptureUpdated,
}: CaptureDetailsScreenProps) {
  const [isUploading, setIsUploading] = useState(false);

  const sendToHub = async () => {
    setIsUploading(true);

    try {
      const uploading = await updateCapture(capture.id, {
        status: 'enviando',
        lastUploadError: undefined,
      });

      if (uploading) {
        onCaptureUpdated(uploading);
      }

      const uploadResult = await uploadVoiceCapture(capture.fileUri, capture);
      const updated = await updateCapture(capture.id, {
        status: 'enviado',
        remoteId: uploadResult.remoteId,
        hubStatus: uploadResult.hubStatus,
        lastUploadError: undefined,
      });

      if (updated) {
        onCaptureUpdated(updated);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tente novamente.';
      const failed = await updateCapture(capture.id, {
        status: 'erro',
        lastUploadError: message,
      });

      if (failed) {
        onCaptureUpdated(failed);
      }

      Alert.alert('Erro ao enviar para o Hub', message);
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Excluir captura', 'Essa acao remove o registro local e o arquivo de audio.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteCapture(capture.id);
          onCaptureDeleted(capture.id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrimaryButton label="Voltar" onPress={onBack} variant="ghost" style={styles.backButton} />

        <View style={styles.header}>
          <Text style={styles.title}>Detalhes</Text>
          <Text style={styles.subtitle}>{formatDateTime(capture.createdAt)}</Text>
        </View>

        <AudioPlayer uri={capture.fileUri} />

        <View style={styles.metadata}>
          <MetadataRow label="Duracao" value={formatDuration(capture.durationSeconds)} />
          <MetadataRow label="Status" value={formatStatus(capture.status)} />
          {capture.remoteId ? <MetadataRow label="ID no Hub" value={capture.remoteId} /> : null}
          {capture.hubStatus ? <MetadataRow label="Status no Hub" value={capture.hubStatus} /> : null}
          {capture.lastUploadError ? (
            <MetadataRow label="Ultimo erro de envio" value={capture.lastUploadError} />
          ) : null}
          <MetadataRow label="Arquivo" value={capture.fileUri} />
          <MetadataRow
            label="Modo"
            value={
              capture.targetDurationSeconds
                ? `Limite de ${formatDuration(capture.targetDurationSeconds)}`
                : 'Livre'
            }
          />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={isUploading ? 'Enviando...' : 'Enviar para o Hub'}
            onPress={sendToHub}
            disabled={isUploading}
          />
          <PrimaryButton label="Excluir captura" onPress={confirmDelete} variant="danger" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAF9',
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#10201D',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#52615E',
    fontSize: 15,
  },
  metadata: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE5E2',
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    borderBottomColor: '#EDF1F0',
    borderBottomWidth: 1,
    gap: 6,
    padding: 14,
  },
  rowLabel: {
    color: '#65736F',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rowValue: {
    color: '#162522',
    fontSize: 15,
    lineHeight: 21,
  },
  actions: {
    gap: 10,
  },
});

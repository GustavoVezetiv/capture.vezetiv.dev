export type CaptureStatus = 'local' | 'enviado' | 'processado' | 'erro' | 'enviado_mock';

export type CaptureMode = 'timed' | 'free';

export type VoiceCapture = {
  id: string;
  createdAt: string;
  durationSeconds: number;
  fileUri: string;
  status: CaptureStatus;
  targetDurationSeconds?: number;
};

export type NewVoiceCaptureInput = Omit<VoiceCapture, 'id' | 'createdAt' | 'status'>;

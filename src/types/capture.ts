export type CaptureStatus =
  | 'local'
  | 'enviando'
  | 'enviado'
  | 'processado'
  | 'erro'
  | 'enviado_mock';

export type CaptureMode = 'timed' | 'free';

export type VoiceCapture = {
  id: string;
  createdAt: string;
  durationSeconds: number;
  fileUri: string;
  status: CaptureStatus;
  targetDurationSeconds?: number;
  remoteId?: string;
  hubStatus?: string;
  lastUploadError?: string;
};

export type NewVoiceCaptureInput = Omit<VoiceCapture, 'id' | 'createdAt' | 'status'>;

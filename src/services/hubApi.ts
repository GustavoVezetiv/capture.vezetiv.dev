import { VoiceCapture } from '../types/capture';

const HUB_API_BASE_URL = process.env.EXPO_PUBLIC_HUB_API_URL ?? '';

type UploadVoiceCaptureResponse = {
  remoteId: string;
  status: 'enviado_mock';
};

export async function uploadVoiceCapture(
  fileUri: string,
  metadata: VoiceCapture,
): Promise<UploadVoiceCaptureResponse> {
  await wait(900);

  return {
    remoteId: `${HUB_API_BASE_URL || 'mock://hub'}/voice-captures/${metadata.id}`,
    status: 'enviado_mock',
  };
}

export async function getVoiceCaptureStatus(id: string): Promise<'enviado_mock'> {
  await wait(400);
  void id;

  return 'enviado_mock';
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

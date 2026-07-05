import { VoiceCapture } from '../types/capture';
import { getCurrentAccessToken } from './supabaseClient';

type UploadVoiceCaptureResponse = {
  remoteId: string;
  hubStatus: string;
  message?: string;
};

type HubUploadResponse = {
  id?: string;
  status?: string;
  message?: string;
};

export async function uploadVoiceCapture(
  fileUri: string,
  metadata: VoiceCapture,
): Promise<UploadVoiceCaptureResponse> {
  const baseUrl = getHubApiBaseUrl();
  const accessToken = await getCurrentAccessToken();
  const formData = new FormData();

  formData.append('audio', {
    uri: fileUri,
    name: getFileName(fileUri),
    type: getMimeType(fileUri),
  } as unknown as Blob);
  formData.append('localId', metadata.id);
  formData.append('createdAt', metadata.createdAt);
  formData.append('durationSeconds', String(metadata.durationSeconds));
  formData.append('source', 'vozetiv-capture-mobile');

  if (metadata.targetDurationSeconds !== undefined) {
    formData.append('targetDurationSeconds', String(metadata.targetDurationSeconds));
  }

  const response = await fetch(`${baseUrl}/api/voice-captures`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getHttpErrorMessage(response));
  }

  const data = (await response.json()) as HubUploadResponse;

  if (!data.id) {
    throw new Error('O Hub respondeu sem id remoto da captura.');
  }

  return {
    remoteId: data.id,
    hubStatus: data.status ?? 'received',
    message: data.message,
  };
}

export async function getVoiceCaptureStatus(id: string): Promise<string> {
  const baseUrl = getHubApiBaseUrl();
  const accessToken = await getCurrentAccessToken();
  const response = await fetch(`${baseUrl}/api/voice-captures/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getHttpErrorMessage(response));
  }

  const data = (await response.json()) as HubUploadResponse;
  return data.status ?? 'unknown';
}

function getHubApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_HUB_API_URL?.trim();

  if (!baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_HUB_API_URL nao configurada. Defina a URL do Hub antes de enviar capturas.',
    );
  }

  return baseUrl.replace(/\/$/, '');
}

async function getHttpErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) {
    return 'Sessao ausente ou expirada. Faca login novamente para enviar ao Hub.';
  }

  const fallback = `Falha ao enviar captura para o Hub. HTTP ${response.status}.`;

  try {
    const text = await response.text();

    if (!text) {
      return fallback;
    }

    try {
      const data = JSON.parse(text) as { message?: string; error?: string };
      return data.message ?? data.error ?? text;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
}

function getFileName(fileUri: string): string {
  const rawName = fileUri.split('/').pop() || `capture-${Date.now()}.m4a`;
  return rawName.includes('.') ? rawName : `${rawName}.m4a`;
}

function getMimeType(fileUri: string): string {
  const extension = getFileName(fileUri).split('.').pop()?.toLowerCase();

  if (extension === 'aac') {
    return 'audio/aac';
  }

  if (extension === 'wav') {
    return 'audio/wav';
  }

  if (extension === 'mp3') {
    return 'audio/mpeg';
  }

  if (extension === '3gp') {
    return 'audio/3gpp';
  }

  return 'audio/mp4';
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import { NewVoiceCaptureInput, VoiceCapture } from '../types/capture';

const STORAGE_KEY = '@capture/voice-captures';

export async function listCaptures(): Promise<VoiceCapture[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  const captures = JSON.parse(raw) as VoiceCapture[];
  return captures.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createCapture(input: NewVoiceCaptureInput): Promise<VoiceCapture> {
  const capture: VoiceCapture = {
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'local',
    ...input,
  };
  const captures = await listCaptures();

  await saveCaptures([capture, ...captures]);
  return capture;
}

export async function updateCapture(
  id: string,
  changes: Partial<VoiceCapture>,
): Promise<VoiceCapture | null> {
  const captures = await listCaptures();
  let updated: VoiceCapture | null = null;
  const nextCaptures = captures.map((capture) => {
    if (capture.id !== id) {
      return capture;
    }

    updated = { ...capture, ...changes };
    return updated;
  });

  await saveCaptures(nextCaptures);
  return updated;
}

export async function deleteCapture(id: string): Promise<void> {
  const captures = await listCaptures();
  const capture = captures.find((item) => item.id === id);
  const nextCaptures = captures.filter((item) => item.id !== id);

  if (capture?.fileUri) {
    await FileSystem.deleteAsync(capture.fileUri, { idempotent: true });
  }

  await saveCaptures(nextCaptures);
}

async function saveCaptures(captures: VoiceCapture[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
}

function createId(): string {
  return `cap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

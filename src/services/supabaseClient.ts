import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const fallbackSupabaseUrl = 'https://not-configured.supabase.co';
const fallbackSupabaseAnonKey = 'not-configured';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase auth is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseAnonKey,
  {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
  },
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
      return;
    }

    supabase.auth.stopAutoRefresh();
  });
}

export function assertSupabaseConfigured(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase nao configurado. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

export async function getCurrentAccessToken(): Promise<string> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Erro ao ler sessao Supabase: ${error.message}`);
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('Sessao ausente ou expirada. Faca login novamente para enviar ao Hub.');
  }

  return accessToken;
}

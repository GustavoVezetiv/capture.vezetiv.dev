import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { assertSupabaseConfigured, supabase } from '../services/supabaseClient';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = async () => {
    setIsSubmitting(true);

    try {
      assertSupabaseConfigured();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      Alert.alert('Erro ao entrar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Vozetiv Capture</Text>
          <Text style={styles.subtitle}>Entre com sua conta do Hub para enviar capturas.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="voce@email.com"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Sua senha"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          <PrimaryButton
            disabled={isSubmitting || !email.trim() || !password}
            label={isSubmitting ? 'Entrando...' : 'Entrar'}
            onPress={signIn}
          />
          {isSubmitting ? <ActivityIndicator color="#176B5B" /> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAF9',
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 28,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    color: '#10201D',
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: '#52615E',
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE5E2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: '#52615E',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F7FAF9',
    borderColor: '#DCE5E2',
    borderRadius: 8,
    borderWidth: 1,
    color: '#10201D',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
});

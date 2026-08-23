import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { styles } from '@/styles/login.styles';

export default function ForgotPasswordScreen() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo');
      return;
    }
    setIsSending(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo enviar el correo');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Te enviaremos un enlace para restablecer tu contraseña
            </Text>
          </View>

          <View style={styles.form}>
            {sent ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>
                  Correo enviado a {email.trim()}
                </Text>
                <Text style={styles.successSubtext}>
                  Revisa tu bandeja de entrada y sigue las instrucciones para
                  restablecer tu contraseña.
                </Text>
                <Pressable
                  style={styles.button}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text style={styles.buttonText}>Volver a login</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Correo</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@correo.com"
                  placeholderTextColor="#52525b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />

                <Pressable
                  style={[styles.button, isSending && styles.buttonDisabled]}
                  onPress={handleReset}
                  disabled={isSending}
                >
                  <Text style={styles.buttonText}>
                    {isSending ? 'Enviando...' : 'Enviar enlace'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.linkButton}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text style={styles.linkText}>
                    <Text style={styles.linkTextBold}>← Volver a login</Text>
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

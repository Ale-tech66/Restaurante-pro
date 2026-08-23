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
import { styles } from '@/styles/auth.styles';

export default function ForgotPasswordScreen() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo');
      return;
    }
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo enviar el correo');
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Correo enviado</Text>
          <Text style={styles.successSubtext}>
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </Text>
          <Pressable
            style={[styles.button, { marginTop: 32, paddingHorizontal: 32 }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Recuperar cuenta</Text>
            <Text style={styles.subtitle}>Te enviaremos un correo de recuperación</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Enviar correo</Text>
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.linkText}>
                <Text style={styles.linkTextBold}>Volver a iniciar sesión</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

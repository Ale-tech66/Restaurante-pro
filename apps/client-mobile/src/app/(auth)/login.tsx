import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { styles } from '@/styles/shared.styles';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        if (!fullName.trim()) { Alert.alert('Error', 'Ingresa tu nombre'); return; }
        await signUp(email.trim(), password, fullName.trim());
        Alert.alert('Cuenta creada', 'Ya puedes iniciar sesión');
        setMode('login');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Algo salió mal');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
            <Text style={styles.title}>Restaurante Pro</Text>
            <Text style={styles.subtitle}>Pide desde tu mesa</Text>
          </View>

          <View style={styles.form}>
            {mode === 'register' && (
              <>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Tu nombre" placeholderTextColor="#71717a" />
              </>
            )}
            <Text style={styles.label}>Correo</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor="#71717a" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#71717a" secureTextEntry />

            <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? '...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</Text>
            </Pressable>

            <Pressable style={styles.linkButton} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
              <Text style={styles.linkText}>
                {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <Text style={styles.linkTextBold}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</Text>
              </Text>
            </Pressable>

            <Pressable style={[styles.linkButton, { marginTop: 24 }]} onPress={() => router.push('/(client)/home' as any)}>
              <Text style={styles.linkText}>Continuar sin cuenta →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

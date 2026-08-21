import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Redirect href="/" />;
  return <Redirect href="/(auth)/login" />;
}

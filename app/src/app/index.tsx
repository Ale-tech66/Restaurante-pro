import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function Index() {
  const { user, role } = useAuthStore();

  if (!user) return <Redirect href="/(auth)/login" />;

  switch (role) {
    case 'admin':
      return <Redirect href="/(admin)/dashboard" />;
    case 'mesero':
      return <Redirect href="/(staff)/mesero/mesas" />;
    case 'cocina':
      return <Redirect href="/(staff)/cocina/kds" />;
    case 'cajero':
      return <Redirect href="/(staff)/caja/pedidos" />;
    case 'cliente':
      return <Redirect href="/(client)/menu" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}

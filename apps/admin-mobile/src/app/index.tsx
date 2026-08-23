import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

// App Admin: admin, gerente, cajero, mesero, cocina.
// El backend determina el rol y abre el panel correspondiente.
export default function Index() {
  const { user, role } = useAuthStore();

  if (!user) return <Redirect href="/(auth)/login" />;

  switch (role) {
    case 'admin':
    case 'gerente':
      return <Redirect href="/(admin)/dashboard" />;
    case 'mesero':
      return <Redirect href="/(staff)/mesero/mesas" />;
    case 'cocina':
      return <Redirect href="/(staff)/cocina/kds" />;
    case 'cajero':
      return <Redirect href="/(staff)/caja/pedidos" />;
    case 'cliente':
      // Los clientes no entran a la app admin
      return <Redirect href="/(auth)/login?error=not-staff" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}

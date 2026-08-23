import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

// App Cliente: los clientes pueden entrar sin login (pedido anónimo vía QR).
// Si tienen cuenta y son clientes, van directo a home.
// Si son staff/admin, no pertenecen a esta app.
export default function Index() {
  const { user, role } = useAuthStore();

  // Sin sesión: permitir entrar a home (puede escanear QR y pedir)
  if (!user) return <Redirect href="/(client)/home" />;

  // Cliente autenticado: directo a home
  if (role === 'cliente') return <Redirect href="/(client)/home" />;

  // Staff/admin no pertenece a la app cliente
  return <Redirect href="/(auth)/login" />;
}

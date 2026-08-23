import { createAuthStore } from '@restaurante-pro/shared';
import { supabase } from './supabase';

export const useAuthStore = createAuthStore(supabase);

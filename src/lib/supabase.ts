// Proporciona el `localStorage` donde Supabase guarda la sesión en el dispositivo,
// para que el usuario siga con la sesión iniciada al volver a abrir la app.
import 'expo-sqlite/localStorage/install';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env } from '@/config/env';
import type { Database } from '@/types/database';

let client: SupabaseClient<Database> | null = null;

/**
 * Cliente único de Supabase. Solo usa la clave pública (anon);
 * la seguridad real la aplican RLS y las funciones RPC en PostgreSQL.
 * Las pantallas no lo importan directamente: lo consumen los servicios de cada feature.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!env) {
    throw new Error('Falta configurar la conexión a Supabase');
  }
  if (!client) {
    const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        // En Android e iOS no hay una URL de la que leer la sesión.
        detectSessionInUrl: false,
      },
    });
    // En el móvil, la renovación del token solo corre mientras la app está en primer plano.
    if (Platform.OS !== 'web') {
      AppState.addEventListener('change', (state) => {
        if (state === 'active') void supabase.auth.startAutoRefresh();
        else void supabase.auth.stopAutoRefresh();
      });
    }
    client = supabase;
  }
  return client;
}

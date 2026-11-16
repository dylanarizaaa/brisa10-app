import { z } from 'zod';

const envSchema = z.object({
  supabaseUrl: z.url(),
  supabaseAnonKey: z.string().min(1),
});

// Expo solo incrusta las variables escritas como process.env.EXPO_PUBLIC_X (acceso estático).
const parsed = envSchema.safeParse({
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Variables de entorno validadas. Es `null` cuando faltan o son inválidas,
 * para que la app muestre una pantalla de configuración en lugar de fallar al abrir.
 */
export const env = parsed.success ? parsed.data : null;

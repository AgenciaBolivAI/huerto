'use client';

import { createBrowserClient } from '@supabase/ssr';

// Cliente para componentes de navegador (checkout, login, dashboard realtime).
// Solo llamar cuando isSupabaseConfigured() sea true.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

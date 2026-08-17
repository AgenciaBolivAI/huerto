// Helper de "degradación elegante": si las variables de entorno no están
// definidas, toda la app funciona en modo local (datos de demostración,
// pedidos simulados y avisos de configuración en el panel admin).
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

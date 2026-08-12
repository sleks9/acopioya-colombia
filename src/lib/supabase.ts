import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  );
}

/**
 * Cliente con la llave publicable. Toda la seguridad vive en Postgres (RLS +
 * funciones security definer), no aqui: esta llave esta pensada para ser
 * publica. El rol anonimo solo puede leer `centros_publicos` y llamar las RPC.
 */
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function hasClientEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createBrowserClient() {
  return createClientComponentClient();
}

export function tryCreateBrowserClient() {
  if (!hasClientEnv()) {
    if (typeof window !== 'undefined') {
      console.error('[public-shell] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY; running in guest-safe mode.');
    }
    return null;
  }

  return createBrowserClient();
}

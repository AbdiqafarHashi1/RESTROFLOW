import { cookies } from 'next/headers';
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export function createServerClient() {
  return createServerComponentClient({ cookies });
}

export function createRouteClient() {
  return createRouteHandlerClient({ cookies });
}

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

export function useAuthProfile() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setUserId(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data: existing } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).maybeSingle();

      if (existing) {
        setProfile(existing as Profile);
      } else {
        const { data: created } = await supabase.from('profiles').insert({
          auth_user_id: user.id,
          phone: user.phone ?? null,
          email: user.email ?? null,
          full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        }).select('*').single();
        setProfile((created as Profile) ?? null);
      }

      setLoading(false);
    }

    load();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      load();
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { loading, userId, profile, isAuthenticated: Boolean(userId) };
}

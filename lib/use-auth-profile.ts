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
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setUserId(null);
          setProfile(null);
          return;
        }

        const user = authData.user;
        if (!user) {
          setUserId(null);
          setProfile(null);
          return;
        }

        setUserId(user.id);
        const { data: existing, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profileError) {
          setProfile(null);
          return;
        }

        setProfile((existing as Profile) ?? null);
      } catch {
        setUserId(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
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

'use client';

import Link from 'next/link';
import { Navbar } from '@/components/public/navbar';
import { useAuthProfile } from '@/lib/use-auth-profile';
import { createBrowserClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const { loading, profile, isAuthenticated } = useAuthProfile();

  async function signOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div>
      <Navbar restaurantName="Beirut.delivery" />
      <main className="container-padding mx-auto max-w-2xl py-8">
        <h1 className="section-title">My Account</h1>
        {!isAuthenticated && !loading ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted">
            Please <Link href="/login" className="text-primary">continue with phone or email</Link> to view your account.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <section className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted">Phone</p>
              <p className="mt-1">{loading ? 'Loading...' : (profile?.phone || 'Not added')}</p>
            </section>
            <section className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted">Email</p>
              <p className="mt-1">{loading ? 'Loading...' : (profile?.email || 'Not added')}</p>
            </section>
            <section className="rounded-2xl border border-border bg-card p-4">
              <p className="font-medium">Coming soon</p>
              <p className="mt-2 text-sm text-muted">Addresses, orders, and reorders will appear here.</p>
            </section>
            {isAuthenticated && <button onClick={signOut} className="rounded-xl border border-border px-4 py-2 text-sm">Sign out</button>}
          </div>
        )}
      </main>
    </div>
  );
}

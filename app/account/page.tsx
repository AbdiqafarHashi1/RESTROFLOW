'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/public/navbar';
import { useAuthProfile } from '@/lib/use-auth-profile';
import { createBrowserClient } from '@/lib/supabase/client';

type RecentOrder = {
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
};

export default function AccountPage() {
  const { loading, profile, isAuthenticated } = useAuthProfile();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) {
        setOrders([]);
        return;
      }
      setOrdersLoading(true);
      try {
        const response = await fetch('/api/orders/recent', { cache: 'no-store' });
        const payload = await response.json();
        setOrders(Array.isArray(payload.orders) ? payload.orders : []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated]);

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
              <p className="font-medium">Recent orders</p>
              {ordersLoading ? <p className="mt-2 text-sm text-muted">Loading orders...</p> : null}
              {!ordersLoading && orders.length === 0 ? <p className="mt-2 text-sm text-muted">No recent orders yet.</p> : null}
              <div className="mt-3 space-y-2">
                {orders.map((order) => (
                  <Link key={order.order_number} href={`/order/${order.order_number}`} className="block rounded-xl border border-border p-3 text-sm hover:border-primary/40">
                    <p className="flex justify-between"><span>#{order.order_number}</span><span>KES {order.total}</span></p>
                    <p className="mt-1 text-muted">{order.order_status} · {order.payment_status}</p>
                  </Link>
                ))}
              </div>
            </section>
            {isAuthenticated && <button onClick={signOut} className="rounded-xl border border-border px-4 py-2 text-sm">Sign out</button>}
          </div>
        )}
      </main>
    </div>
  );
}

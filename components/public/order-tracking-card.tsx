'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { readActiveOrderRef } from '@/lib/customer-orders';
import { useOrderLiveRefresh } from '@/lib/use-order-live-refresh';

type OrderPayload = {
  order_number: string;
  payment_method: string;
  payment_status: 'not_required' | 'pending' | 'confirmed' | 'failed';
  order_status: 'new' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  customer_marked_paid: boolean;
  total: number;
  customer_phone: string;
  customer_name: string;
  created_at: string;
};

function statusLabel(orderStatus: OrderPayload['order_status']) {
  switch (orderStatus) {
    case 'new': return 'Order received';
    case 'confirmed': return 'Order confirmed';
    case 'preparing': return 'Preparing';
    case 'out_for_delivery': return 'Out for delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return 'Order received';
  }
}

function paymentLabel(paymentStatus: OrderPayload['payment_status']) {
  if (paymentStatus === 'confirmed') return 'Payment confirmed';
  if (paymentStatus === 'pending') return 'Payment pending';
  if (paymentStatus === 'failed') return 'Payment failed';
  return 'Payment not required';
}

export function OrderTrackingCard({
  orderNumber,
  initialToken,
  initialPhone,
  restaurantPhone,
}: {
  orderNumber: string;
  initialToken?: string;
  initialPhone?: string;
  restaurantPhone: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderPayload | null>(null);

  const activeRef = useMemo(() => readActiveOrderRef(), []);
  const guestToken = initialToken || (activeRef?.orderNumber === orderNumber ? activeRef.guestToken : '');
  const customerPhone = initialPhone || (activeRef?.orderNumber === orderNumber ? activeRef.customerPhone : '');

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ orderNumber });
      if (guestToken) params.set('guestToken', guestToken);
      if (customerPhone) params.set('customerPhone', customerPhone);
      const response = await fetch(`/api/order/status?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || 'Order not found.');
        setOrder(null);
        return;
      }
      setOrder(payload.order as OrderPayload);
    } catch {
      setError('Unable to load order right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, guestToken, customerPhone]);

  useOrderLiveRefresh({
    orderNumber,
    refresh: loadOrder,
    pollIntervalMs: 7000,
    runImmediate: true,
  });

  if (loading && !order) {
    return <p className="mt-6 text-sm text-muted">Loading your order...</p>;
  }

  if (error && !order) {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        <p>{error}</p>
        <p className="mt-2 text-red-100">If you just placed your order, return to checkout confirmation and use the &quot;View Order Status&quot; button.</p>
        <div className="mt-3 flex gap-2">
          <Link href="/menu" className="btn-secondary">Back to Menu</Link>
          <button type="button" onClick={loadOrder} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex justify-between text-sm text-muted"><span>Status</span><span className="text-white">{statusLabel(order.order_status)}</span></p>
        <p className="mt-2 flex justify-between text-sm text-muted"><span>Payment</span><span className="text-white">{paymentLabel(order.payment_status)}</span></p>
        <p className="mt-2 flex justify-between text-sm text-muted"><span>Total</span><span className="text-primary">KES {order.total}</span></p>
        <p className="mt-2 flex justify-between text-sm text-muted"><span>Customer</span><span className="text-white">{order.customer_name}</span></p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm text-muted">Need help?</p>
        <a className="mt-2 inline-block text-primary" href={`tel:${restaurantPhone}`}>Call restaurant: {restaurantPhone || 'Not set'}</a>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MarkPaidButton } from '@/components/public/mark-paid-button';
import type { OrderStatus, PaymentStatus } from '@/types';

type PendingOrderState = {
  order_number: string;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  customer_marked_paid: boolean;
  customer_marked_paid_at?: string | null;
};

const POLL_INTERVAL_MS = 5000;

function getStateCopy(order: PendingOrderState) {
  if (order.order_status === 'cancelled') {
    return {
      label: 'Cancelled',
      title: 'Order cancelled',
      description: 'Please contact the restaurant if you need help.',
    };
  }

  if (order.payment_status === 'pending') {
    if (order.customer_marked_paid) {
      return {
        label: 'Payment Notification Sent',
        title: 'Waiting for restaurant confirmation',
        description: 'We have notified the restaurant to verify your payment.',
      };
    }

    return {
      label: 'Payment Pending',
      title: 'Payment Pending',
      description: 'We are waiting for your payment.',
    };
  }

  if (order.payment_status === 'confirmed') {
    if (order.order_status === 'preparing') {
      return {
        label: 'Preparing Your Order',
        title: 'Preparing your order',
        description: 'Our kitchen is preparing your order.',
      };
    }

    if (order.order_status === 'out_for_delivery') {
      return {
        label: 'Out for Delivery',
        title: 'Out for delivery',
        description: 'Your order is on the way.',
      };
    }

    if (order.order_status === 'delivered') {
      return {
        label: 'Delivered',
        title: 'Delivered',
        description: 'Enjoy your meal.',
      };
    }

    return {
      label: 'Payment Received',
      title: 'Order Confirmed',
      description: 'Your payment has been confirmed. Preparing your order.',
    };
  }

  return {
    label: 'Payment Pending',
    title: 'Payment Pending',
    description: 'We are waiting for your payment.',
  };
}

export function PaymentPendingLiveCard({
  orderNumber,
  total,
  paymentNumber,
  orderType,
  paymentMethod,
  restaurantPhone,
  customerPhone,
  whatsappLink,
  initialState,
}: {
  orderNumber: string;
  total: string;
  paymentNumber: string;
  orderType: string;
  paymentMethod: string;
  restaurantPhone: string;
  customerPhone: string;
  whatsappLink: string;
  initialState: PendingOrderState;
}) {
  const [orderState, setOrderState] = useState<PendingOrderState>(initialState);

  const loadOrderState = useCallback(async () => {
    try {
      const response = await fetch(`/api/order/status?orderNumber=${encodeURIComponent(orderNumber)}`, { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      if (payload?.order) {
        setOrderState(payload.order as PendingOrderState);
      }
    } catch {
      // keep current state
    }
  }, [orderNumber]);

  useEffect(() => {
    const id = window.setInterval(loadOrderState, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [loadOrderState]);

  const stateCopy = useMemo(() => getStateCopy(orderState), [orderState]);
  const canMarkPaid = orderState.payment_method === 'send_money' && orderState.payment_status === 'pending' && !orderState.customer_marked_paid;

  return (
    <>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{stateCopy.label}</p>
      <h1 className="mt-3 text-center font-heading text-3xl">Order #{orderNumber}</h1>
      <p className="mt-2 text-center text-muted">{stateCopy.description}</p>

      <div className="mt-5 rounded-2xl border border-amber-300/40 bg-card p-4 md:mt-6 md:p-5">
        <p className="text-center text-lg font-semibold text-amber-300">{stateCopy.title}</p>
        <p className="mt-4 flex justify-between text-sm text-muted"><span>Total Amount</span><span className="text-white">KES {total || '-'}</span></p>
        <p className="mt-2 flex justify-between text-sm text-muted"><span>Send Money Number</span><span className="text-white">{paymentNumber || '-'}</span></p>
        <p className="mt-2 text-sm text-muted">Please send the exact amount and include order number <span className="text-white">{orderNumber}</span> in your transfer message.</p>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-card p-4 text-sm md:mt-4 md:p-5">
        <p className="flex justify-between text-muted"><span>Order Type</span><span className="text-white">{orderType || '-'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Payment Method</span><span className="text-white">{paymentMethod || 'send_money'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Restaurant Phone</span><span className="text-white">{restaurantPhone || '-'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Your Phone</span><span className="text-white">{customerPhone || '-'}</span></p>
      </div>

      <div className="mt-4 grid gap-3">
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary w-full text-center">WhatsApp Us</a>
        <a href={`tel:${restaurantPhone}`} className="btn-secondary w-full text-center">Call Restaurant</a>
        <MarkPaidButton orderNumber={orderNumber} disabled={!canMarkPaid} onSuccess={loadOrderState} />
        <Link href="/menu" className="btn-secondary w-full text-center">Return to Menu</Link>
      </div>
    </>
  );
}

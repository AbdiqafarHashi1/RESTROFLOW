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

type StateCopy = {
  label: string;
  title: string;
  description: string;
  tone: 'pending' | 'success' | 'active' | 'muted';
};

function getStateCopy(order: PendingOrderState): StateCopy {
  if (order.order_status === 'cancelled') {
    return {
      label: 'Cancelled',
      title: 'Order cancelled',
      description: 'Please contact the restaurant if you need help.',
      tone: 'muted',
    };
  }

  if (order.payment_status === 'pending') {
    if (order.customer_marked_paid) {
      return {
        label: 'Payment Notification Sent',
        title: 'Waiting for restaurant confirmation',
        description: 'We have notified the restaurant to verify your payment.',
        tone: 'pending',
      };
    }

    return {
      label: 'Payment Pending',
      title: 'Payment Pending',
      description: 'Please complete your transfer to continue with order confirmation.',
      tone: 'pending',
    };
  }

  if (order.payment_status === 'confirmed') {
    if (order.order_status === 'preparing') {
      return {
        label: 'Preparing',
        title: 'Preparing your order',
        description: 'Our kitchen is preparing your order.',
        tone: 'active',
      };
    }

    if (order.order_status === 'out_for_delivery') {
      return {
        label: 'Out for Delivery',
        title: 'Out for delivery',
        description: 'Your order is on the way.',
        tone: 'active',
      };
    }

    if (order.order_status === 'delivered') {
      return {
        label: 'Delivered',
        title: 'Delivered',
        description: 'Enjoy your meal.',
        tone: 'success',
      };
    }

    return {
      label: 'Payment Received',
      title: 'Order Confirmed',
      description: 'Your payment has been confirmed. Preparing your order.',
      tone: 'success',
    };
  }

  return {
    label: 'Payment Pending',
    title: 'Payment Pending',
    description: 'We are waiting for your payment.',
    tone: 'pending',
  };
}

function getToneClasses(tone: StateCopy['tone']) {
  if (tone === 'success') {
    return {
      label: 'text-emerald-300',
      panel: 'border-emerald-400/45 bg-emerald-500/10',
      title: 'text-emerald-200',
      chip: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200',
    };
  }

  if (tone === 'active') {
    return {
      label: 'text-sky-300',
      panel: 'border-sky-400/40 bg-sky-500/10',
      title: 'text-sky-200',
      chip: 'border-sky-400/30 bg-sky-500/15 text-sky-200',
    };
  }

  if (tone === 'muted') {
    return {
      label: 'text-zinc-300',
      panel: 'border-zinc-500/50 bg-zinc-600/10',
      title: 'text-zinc-200',
      chip: 'border-zinc-400/35 bg-zinc-700/20 text-zinc-200',
    };
  }

  return {
    label: 'text-amber-300',
    panel: 'border-amber-300/45 bg-amber-500/10',
    title: 'text-amber-200',
    chip: 'border-amber-300/35 bg-amber-500/15 text-amber-200',
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
  guestToken,
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
  guestToken?: string;
}) {
  const [orderState, setOrderState] = useState<PendingOrderState>(initialState);

  const loadOrderState = useCallback(async () => {
    try {
      const params = new URLSearchParams({ orderNumber, customerPhone });
      if (guestToken) {
        params.set('guestToken', guestToken);
      }
      const response = await fetch(`/api/order/status?${params.toString()}`, { cache: 'no-store' });
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
  }, [orderNumber, guestToken, customerPhone]);

  useEffect(() => {
    const id = window.setInterval(loadOrderState, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [loadOrderState]);

  const stateCopy = useMemo(() => getStateCopy(orderState), [orderState]);
  const tone = getToneClasses(stateCopy.tone);
  const canMarkPaid = orderState.payment_method === 'send_money' && orderState.payment_status === 'pending' && !orderState.customer_marked_paid;
  const showPaymentInstructions = orderState.payment_method === 'send_money' && orderState.payment_status === 'pending';

  return (
    <>
      <p className={`text-center text-xs font-semibold uppercase tracking-[0.2em] ${tone.label}`}>{stateCopy.label}</p>
      <h1 className="mt-3 text-center font-heading text-3xl">Order #{orderNumber}</h1>
      <p className="mt-2 text-center text-muted">{stateCopy.description}</p>

      <div className={`mt-5 rounded-2xl border p-4 md:mt-6 md:p-5 ${tone.panel}`}>
        <div className="flex items-center justify-between gap-3">
          <p className={`text-lg font-semibold ${tone.title}`}>{stateCopy.title}</p>
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${tone.chip}`}>{stateCopy.label}</span>
        </div>

        <p className="mt-4 flex justify-between text-sm text-muted"><span>Total Amount</span><span className="text-white">KES {total || '-'}</span></p>

        {showPaymentInstructions ? (
          <>
            <p className="mt-2 flex justify-between text-sm text-muted"><span>Send Money Number</span><span className="text-white">{paymentNumber || '-'}</span></p>
            <p className="mt-2 text-sm text-muted">Please send the exact amount and include order number <span className="text-white">{orderNumber}</span> in your transfer message.</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">Payment received successfully. We are now progressing your order through preparation and delivery.</p>
        )}
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
        <MarkPaidButton orderNumber={orderNumber} guestToken={guestToken} customerPhone={customerPhone} disabled={!canMarkPaid} onSuccess={loadOrderState} />
        <Link href={`/order/${orderNumber}${guestToken ? `?guestToken=${encodeURIComponent(guestToken)}&customerPhone=${encodeURIComponent(customerPhone)}` : ""}`} className="btn-secondary w-full text-center">View Order Status</Link>
        <Link href="/menu" className="btn-secondary w-full text-center">Return to Menu</Link>
      </div>
    </>
  );
}

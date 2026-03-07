'use client';

import { useState } from 'react';

export function MarkPaidButton({ orderNumber }: { orderNumber: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function markPaid() {
    setLoading(true);
    await fetch('/api/order/payment-marked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber }),
    });
    setLoading(false);
    setDone(true);
  }

  return (
    <button type="button" onClick={markPaid} disabled={loading || done} className="btn-secondary w-full">
      {done ? 'Payment notification sent' : loading ? 'Sending...' : 'I Have Paid'}
    </button>
  );
}

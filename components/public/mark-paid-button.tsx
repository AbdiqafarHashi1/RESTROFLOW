'use client';

import { useState } from 'react';

export function MarkPaidButton({
  orderNumber,
  disabled = false,
  onSuccess,
}: {
  orderNumber: string;
  disabled?: boolean;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function markPaid() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/order/payment-marked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? 'Unable to send payment notification. Please try again.');
        return;
      }

      setDone(true);
      setMessage(payload.message ?? 'We have notified the restaurant to verify your payment.');
      onSuccess?.();
    } catch {
      setMessage('Unable to send payment notification. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = disabled || loading || done;

  return (
    <div className="space-y-2">
      <button type="button" onClick={markPaid} disabled={isDisabled} className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-70">
        {done ? 'Payment notification sent' : loading ? 'Sending...' : 'I Have Paid'}
      </button>
      {message ? <p className="text-center text-xs text-amber-200">{message}</p> : null}
    </div>
  );
}

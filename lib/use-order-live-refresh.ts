'use client';

import { useEffect } from 'react';
import { tryCreateBrowserClient } from '@/lib/supabase/client';

type RealtimeRow = {
  payment_status?: string | null;
  order_status?: string | null;
  customer_marked_paid?: boolean | null;
  customer_marked_paid_at?: string | null;
};

function hasTrackedOrderChange(previousRow: RealtimeRow, nextRow: RealtimeRow) {
  return (
    previousRow.payment_status !== nextRow.payment_status
    || previousRow.order_status !== nextRow.order_status
    || previousRow.customer_marked_paid !== nextRow.customer_marked_paid
    || previousRow.customer_marked_paid_at !== nextRow.customer_marked_paid_at
  );
}

export function useOrderLiveRefresh({
  orderNumber,
  refresh,
  pollIntervalMs,
  runImmediate = false,
}: {
  orderNumber: string;
  refresh: () => Promise<void> | void;
  pollIntervalMs: number;
  runImmediate?: boolean;
}) {
  useEffect(() => {
    if (!orderNumber) {
      return;
    }

    const refreshOrder = () => {
      void refresh();
    };

    if (runImmediate) {
      refreshOrder();
    }

    const pollId = window.setInterval(refreshOrder, pollIntervalMs);
    const supabase = tryCreateBrowserClient();

    if (!supabase) {
      return () => {
        window.clearInterval(pollId);
      };
    }

    const channelName = `order-status:${orderNumber}:${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_number=eq.${orderNumber}`,
      }, (payload) => {
        const oldRow = (payload.old ?? {}) as RealtimeRow;
        const newRow = (payload.new ?? {}) as RealtimeRow;

        if (hasTrackedOrderChange(oldRow, newRow)) {
          refreshOrder();
        }
      })
      .subscribe();

    return () => {
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [orderNumber, pollIntervalMs, refresh, runImmediate]);
}

import { quickUpdateOrderState } from '@/actions/admin';

type QuickAction = {
  label: string;
  orderStatus?: string;
  paymentStatus?: string;
  className?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Confirm Payment', paymentStatus: 'confirmed' },
  { label: 'Confirm Order', orderStatus: 'confirmed' },
  { label: 'Preparing', orderStatus: 'preparing' },
  { label: 'Out for Delivery', orderStatus: 'out_for_delivery' },
  { label: 'Delivered', orderStatus: 'delivered', paymentStatus: 'confirmed' },
  { label: 'Cancel', orderStatus: 'cancelled', className: 'border-red-500/40 text-red-300 hover:border-red-400' },
];

export function OrderQuickActions({
  orderId,
  compact = false,
}: {
  orderId: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'mt-3 flex flex-wrap gap-2'}>
      {QUICK_ACTIONS.map((action) => (
        <form key={action.label} action={quickUpdateOrderState}>
          <input type="hidden" name="orderId" value={orderId} />
          {action.orderStatus && <input type="hidden" name="orderStatus" value={action.orderStatus} />}
          {action.paymentStatus && <input type="hidden" name="paymentStatus" value={action.paymentStatus} />}
          <button className={`rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-primary/40 ${action.className ?? ''}`}>
            {action.label}
          </button>
        </form>
      ))}
    </div>
  );
}

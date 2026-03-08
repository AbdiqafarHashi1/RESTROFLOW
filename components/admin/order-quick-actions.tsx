import { quickUpdateOrderState } from '@/actions/admin';
import type { OrderStatus, PaymentStatus } from '@/types';

type QuickAction = {
  label: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  emphasis?: 'primary' | 'danger';
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Confirm Order', orderStatus: 'confirmed' },
  { label: 'Preparing', orderStatus: 'preparing' },
  { label: 'Out for Delivery', orderStatus: 'out_for_delivery' },
  { label: 'Delivered', orderStatus: 'delivered', paymentStatus: 'confirmed', emphasis: 'primary' },
  { label: 'Cancel', orderStatus: 'cancelled', emphasis: 'danger' },
];

function isDisabled(action: QuickAction, orderStatus?: OrderStatus) {
  if (!orderStatus) return false;
  if (orderStatus === 'delivered' || orderStatus === 'cancelled') return action.orderStatus !== orderStatus;
  return action.orderStatus === orderStatus;
}

function isActive(action: QuickAction, orderStatus?: OrderStatus) {
  if (!orderStatus || !action.orderStatus) return false;
  return action.orderStatus === orderStatus;
}

export function OrderQuickActions({
  orderId,
  orderStatus,
  paymentStatus,
  compact = false,
}: {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  compact?: boolean;
}) {
  const canConfirmPayment = paymentStatus === 'pending';

  return (
    <div className={compact ? 'space-y-2' : 'mt-3 space-y-2'}>
      {canConfirmPayment ? (
        <form action={quickUpdateOrderState}>
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="paymentStatus" value="confirmed" />
          <button className="w-full rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20">
            Confirm Payment
          </button>
        </form>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {QUICK_ACTIONS.map((action) => {
          const disabled = isDisabled(action, orderStatus);
          const active = isActive(action, orderStatus);

          return (
            <form key={action.label} action={quickUpdateOrderState}>
              <input type="hidden" name="orderId" value={orderId} />
              {action.orderStatus && <input type="hidden" name="orderStatus" value={action.orderStatus} />}
              {action.paymentStatus && <input type="hidden" name="paymentStatus" value={action.paymentStatus} />}
              <button
                disabled={disabled}
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  active
                    ? 'border-primary bg-primary text-black'
                    : action.emphasis === 'danger'
                      ? 'border-red-500/40 text-red-300 hover:border-red-400 disabled:opacity-35'
                      : action.emphasis === 'primary'
                        ? 'border-primary/45 text-primary hover:bg-primary/10 disabled:opacity-35'
                        : 'border-border text-muted hover:border-primary/45 hover:text-white disabled:opacity-35'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
              >
                {action.label}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

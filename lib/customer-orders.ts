'use client';

export const ACTIVE_ORDER_KEY = 'beirut-active-order';

export type ActiveOrderRef = {
  orderNumber: string;
  customerPhone: string;
  guestToken: string;
  placedAt: string;
};

function hasWindow() {
  return typeof window !== 'undefined';
}

export function saveActiveOrderRef(ref: ActiveOrderRef) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(ref));
  } catch {
    // ignore storage limits
  }
}

export function readActiveOrderRef(): ActiveOrderRef | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveOrderRef>;
    if (!parsed.orderNumber || !parsed.customerPhone || !parsed.guestToken) {
      return null;
    }
    return {
      orderNumber: parsed.orderNumber,
      customerPhone: parsed.customerPhone,
      guestToken: parsed.guestToken,
      placedAt: parsed.placedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearActiveOrderRef() {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(ACTIVE_ORDER_KEY);
  } catch {
    // ignore
  }
}

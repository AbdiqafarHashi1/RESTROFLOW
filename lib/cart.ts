import { CartItem } from '@/types';

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}

export function cartTotal(items: CartItem[], deliveryFee: number, orderType: 'delivery' | 'pickup') {
  const subtotal = cartSubtotal(items);
  return subtotal + (orderType === 'delivery' ? deliveryFee : 0);
}

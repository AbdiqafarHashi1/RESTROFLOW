import { CartItem } from '@/types';

export function buildWhatsAppUrl(params: {
  whatsappNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  area?: string;
  address?: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  currency?: string;
}) {
  const lines = [
    `Hello Beirut Restaurant, I am confirming order ${params.orderNumber}.`,
    `Name: ${params.customerName}`,
    `Phone: ${params.customerPhone}`,
    `Order Type: ${params.orderType}`,
    params.orderType === 'delivery' ? `Area: ${params.area ?? '-'} | Address: ${params.address ?? '-'}` : 'Pickup Order',
    `Payment: ${params.paymentMethod}`,
    'Items:',
    ...params.items.map((item) => `- ${item.item_name} x${item.quantity}`),
    `Total: ${(params.currency ?? 'KES')} ${params.total}`,
    '',
    'Order Status:',
    `https://beirut.delivery/order/${params.orderNumber}`,
  ];

  return `https://wa.me/${params.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

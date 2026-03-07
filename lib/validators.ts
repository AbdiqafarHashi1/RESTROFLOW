import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  orderType: z.enum(['delivery', 'pickup']),
  area: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash_on_delivery', 'pay_on_pickup']),
  items: z.array(z.object({ menu_item_id: z.string(), quantity: z.number().int().min(1) })).min(1),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;

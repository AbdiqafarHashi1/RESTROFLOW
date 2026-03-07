import { z } from 'zod';

const checkoutBaseSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  orderType: z.enum(['delivery', 'pickup']),
  area: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash_on_delivery', 'pay_on_pickup', 'send_money']),
  items: z.array(z.object({ menu_item_id: z.string(), quantity: z.number().int().min(1) })).min(1),
});

export const checkoutFormSchema = checkoutBaseSchema.omit({ items: true }).superRefine((value, ctx) => {
  if (value.orderType === 'delivery') {
    if (!value.area?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Area is required for delivery', path: ['area'] });
    }
    if (!value.address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Address is required for delivery', path: ['address'] });
    }
  }
});

export const checkoutSchema = checkoutBaseSchema.superRefine((value, ctx) => {
  if (value.orderType === 'delivery') {
    if (!value.area?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Area is required for delivery', path: ['area'] });
    }
    if (!value.address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Address is required for delivery', path: ['address'] });
    }
  }
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type CheckoutFormPayload = z.infer<typeof checkoutFormSchema>;

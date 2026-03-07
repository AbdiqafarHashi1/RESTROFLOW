import { NextResponse } from 'next/server';
import { checkoutSchema } from '@/lib/validators';
import { createRouteClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/order';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const supabase = createRouteClient();

  const { data: menuRows } = await supabase
    .from('menu_items')
    .select('id,name,price')
    .in('id', payload.items.map((i) => i.menu_item_id))
    .eq('active', true);

  if (!menuRows?.length) {
    return NextResponse.json({ error: 'No valid menu items found.' }, { status: 400 });
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id,whatsapp_number,delivery_fee,currency')
    .eq('slug', 'beirut-express')
    .single();

  const priceMap = new Map((menuRows ?? []).map((row) => [row.id, row]));
  const allMatched = payload.items.every((item) => priceMap.has(item.menu_item_id));
  if (!allMatched) {
    return NextResponse.json({ error: 'One or more cart items are unavailable.' }, { status: 400 });
  }

  const subtotal = payload.items.reduce((sum, item) => sum + ((priceMap.get(item.menu_item_id)?.price ?? 0) * item.quantity), 0);
  const deliveryFee = payload.orderType === 'delivery' ? Number(restaurant?.delivery_fee ?? 150) : 0;
  const total = subtotal + deliveryFee;

  const seq = Math.floor(Math.random() * 999999);
  const orderNumber = generateOrderNumber(seq);
  const restaurantId = restaurant?.id ?? '11111111-1111-1111-1111-111111111111';

  const { data: order, error } = await supabase.from('orders').insert({
    restaurant_id: restaurantId,
    order_number: orderNumber,
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    order_type: payload.orderType,
    area: payload.area,
    address: payload.address,
    notes: payload.notes,
    payment_method: payload.paymentMethod,
    subtotal,
    delivery_fee: deliveryFee,
    total,
  }).select('id').single();

  if (error || !order) {
    return NextResponse.json({ error: error?.message ?? 'Order failed' }, { status: 500 });
  }

  const orderItems = payload.items.map((item) => {
    const menu = priceMap.get(item.menu_item_id);
    return {
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: menu?.name ?? 'Item',
      quantity: item.quantity,
      unit_price: menu?.price ?? 0,
      total_price: (menu?.price ?? 0) * item.quantity,
    };
  });

  await supabase.from('order_items').insert(orderItems);

  await supabase.rpc('upsert_customer_from_order', {
    p_restaurant_id: restaurantId,
    p_name: payload.customerName,
    p_phone: payload.customerPhone,
  });

  const whatsappUrl = buildWhatsAppUrl({
    whatsappNumber: restaurant?.whatsapp_number ?? '254700000001',
    orderNumber,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    orderType: payload.orderType,
    area: payload.area,
    address: payload.address,
    paymentMethod: payload.paymentMethod,
    items: orderItems.map((i) => ({ menu_item_id: i.menu_item_id, item_name: i.item_name, unit_price: Number(i.unit_price), quantity: i.quantity })),
    total,
    currency: restaurant?.currency ?? 'KES',
  });

  return NextResponse.json({ orderNumber, total, paymentMethod: payload.paymentMethod, orderType: payload.orderType, whatsappUrl });
}

import { NextResponse } from 'next/server';
import { checkoutSchema } from '@/lib/validators';
import { createRouteClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/order';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

function buildPaymentStatus(paymentMethod: 'cash_on_delivery' | 'pay_on_pickup' | 'send_money') {
  return paymentMethod === 'send_money' ? 'pending' : 'not_required';
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  if (!payload.items.length) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }

  const supabase = createRouteClient();

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id,whatsapp_number,payment_number,phone,delivery_fee,currency')
    .eq('slug', 'beirut-express')
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: restaurantError?.message ?? 'Restaurant settings not found.' }, { status: 500 });
  }

  const { data: menuRows, error: menuError } = await supabase
    .from('menu_items')
    .select('id,name,price')
    .in('id', payload.items.map((i) => i.menu_item_id))
    .eq('active', true);

  if (menuError) {
    return NextResponse.json({ error: menuError.message }, { status: 500 });
  }

  if (!menuRows?.length) {
    return NextResponse.json({ error: 'No valid menu items found.' }, { status: 400 });
  }

  const priceMap = new Map((menuRows ?? []).map((row) => [row.id, row]));
  const allMatched = payload.items.every((item) => priceMap.has(item.menu_item_id));
  if (!allMatched) {
    return NextResponse.json({ error: 'One or more cart items are unavailable.' }, { status: 400 });
  }

  const subtotal = payload.items.reduce((sum, item) => sum + ((priceMap.get(item.menu_item_id)?.price ?? 0) * item.quantity), 0);
  const deliveryFee = payload.orderType === 'delivery' ? Number(restaurant.delivery_fee ?? 0) : 0;
  const total = subtotal + deliveryFee;
  const paymentStatus = buildPaymentStatus(payload.paymentMethod);

  let order: { id: string; order_number: string } | null = null;
  let attempts = 0;
  while (!order && attempts < 4) {
    attempts += 1;
    const orderNumber = generateOrderNumber(Math.floor(Math.random() * 999999));
    const { data: created, error } = await supabase.from('orders').insert({
      restaurant_id: restaurant.id,
      order_number: orderNumber,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      order_type: payload.orderType,
      area: payload.area,
      address: payload.address,
      notes: payload.notes,
      payment_method: payload.paymentMethod,
      payment_status: paymentStatus,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      order_status: 'new',
    }).select('id,order_number').single();

    if (error) {
      if (error.code === '23505') {
        continue;
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    order = created;
  }

  if (!order) {
    return NextResponse.json({ error: 'Failed to generate order number. Please retry.' }, { status: 500 });
  }

  const orderItems = payload.items.map((item) => {
    const menu = priceMap.get(item.menu_item_id);
    return {
      order_id: order!.id,
      menu_item_id: item.menu_item_id,
      item_name: menu?.name ?? 'Item',
      quantity: item.quantity,
      unit_price: menu?.price ?? 0,
      total_price: (menu?.price ?? 0) * item.quantity,
    };
  });

  const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems);
  if (orderItemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
  }

  await supabase.rpc('upsert_customer_from_order', {
    p_restaurant_id: restaurant.id,
    p_name: payload.customerName,
    p_phone: payload.customerPhone,
  });

  const whatsappUrl = buildWhatsAppUrl({
    whatsappNumber: restaurant.whatsapp_number ?? '254700000001',
    orderNumber: order.order_number,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    orderType: payload.orderType,
    area: payload.area,
    address: payload.address,
    paymentMethod: payload.paymentMethod,
    items: orderItems.map((i) => ({ menu_item_id: i.menu_item_id, item_name: i.item_name, unit_price: Number(i.unit_price), quantity: i.quantity })),
    total,
    currency: restaurant.currency ?? 'KES',
  });

  return NextResponse.json({
    orderNumber: order.order_number,
    total,
    paymentMethod: payload.paymentMethod,
    paymentStatus,
    orderType: payload.orderType,
    whatsappUrl,
    paymentNumber: restaurant.payment_number,
    restaurantPhone: restaurant.phone,
    customerPhone: payload.customerPhone,
    redirectTo: payload.paymentMethod === 'send_money' ? `/order/pending/${order.order_number}` : `/order/success/${order.order_number}`,
  });
}

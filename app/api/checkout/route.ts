import { NextResponse } from 'next/server';
import { checkoutSchema } from '@/lib/validators';
import { createRouteClient, createServiceRoleClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/order';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

function buildPaymentStatus(paymentMethod: 'cash_on_delivery' | 'pay_on_pickup' | 'send_money') {
  return paymentMethod === 'send_money' ? 'pending' : 'not_required';
}

export async function POST(request: Request) {
  try {
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
    const serviceRoleKeyPresent = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.info('Checkout runtime env check', { serviceRoleKeyPresent });

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id,whatsapp_number,payment_number,phone,delivery_fee,currency')
      .eq('slug', 'beirut-express')
      .single();

    if (restaurantError || !restaurant) {
      console.error('Checkout restaurant query failed', restaurantError);
      return NextResponse.json({ error: restaurantError?.message ?? 'Restaurant settings not found.' }, { status: 500 });
    }

    const { data: menuRows, error: menuError } = await supabase
      .from('menu_items')
      .select('id,name,price')
      .in('id', payload.items.map((i) => i.menu_item_id))
      .eq('active', true);

    if (menuError) {
      console.error('Checkout menu query failed', menuError);
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

    const adminSupabase = createServiceRoleClient();
    console.info('Checkout write client selected', { helper: 'createServiceRoleClient' });

    let order: { id: string; order_number: string } | null = null;
    let attempts = 0;
    while (!order && attempts < 4) {
      attempts += 1;
      const orderNumber = generateOrderNumber(Math.floor(Math.random() * 999999));
      console.info('Checkout before orders insert', { attempt: attempts, orderNumber });
      const { data: created, error } = await adminSupabase.from('orders').insert({
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
        console.error('Checkout orders insert error object', error);
        if (error.code === '23505') {
          continue;
        }
        console.error('Checkout order insert failed', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.info('Checkout after orders insert', { orderId: created?.id, orderNumber: created?.order_number });
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

    console.info('Checkout before order_items insert', { orderId: order.id, count: orderItems.length });
    const { error: orderItemsError } = await adminSupabase.from('order_items').insert(orderItems);
    if (orderItemsError) {
      console.error('Checkout order_items insert error object', orderItemsError);
      await adminSupabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
    }

    console.info('Checkout after order_items insert', { orderId: order.id });
    console.info('Checkout before customers upsert', { customerPhone: payload.customerPhone });
    const { error: customerRpcError } = await adminSupabase.rpc('upsert_customer_from_order', {
      p_restaurant_id: restaurant.id,
      p_name: payload.customerName,
      p_phone: payload.customerPhone,
    });

    if (customerRpcError) {
      console.error('Checkout customers upsert error object', customerRpcError);
      return NextResponse.json({ error: 'Order created, but customer profile update failed.' }, { status: 500 });
    }

    console.info('Checkout after customers upsert', { customerPhone: payload.customerPhone });

    const whatsappUrl = buildWhatsAppUrl({
      whatsappNumber: restaurant.whatsapp_number ?? '',
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
  } catch (error) {
    console.error('Unexpected checkout route error', error);
    return NextResponse.json({ error: 'Unexpected server error while placing order.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = String(body.orderNumber ?? '');

  if (!orderNumber) {
    return NextResponse.json({ error: 'Missing order number.' }, { status: 400 });
  }

  const supabase = createRouteClient();
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id,payment_method,payment_status,customer_marked_paid')
    .eq('order_number', orderNumber)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.payment_method !== 'send_money' || order.payment_status !== 'pending') {
    return NextResponse.json({ ok: true, message: 'Payment is already being processed.' });
  }

  if (order.customer_marked_paid) {
    return NextResponse.json({ ok: true, message: 'Payment notification already sent.', alreadyMarked: true });
  }

  const { error } = await supabase
    .from('orders')
    .update({ customer_marked_paid: true, customer_marked_paid_at: new Date().toISOString() })
    .eq('order_number', orderNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Payment notification sent.' });
}

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = String(searchParams.get('orderNumber') ?? '');

  if (!orderNumber) {
    return NextResponse.json({ error: 'Missing order number.' }, { status: 400 });
  }

  const supabase = createRouteClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('order_number,payment_method,payment_status,order_status,customer_marked_paid,customer_marked_paid_at')
    .eq('order_number', orderNumber)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

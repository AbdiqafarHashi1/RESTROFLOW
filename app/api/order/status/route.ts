import { NextResponse } from 'next/server';
import { createRouteClient, createServiceRoleClient } from '@/lib/supabase/server';
import { verifyGuestOrderToken } from '@/lib/order';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = String(searchParams.get('orderNumber') ?? '');
  const guestToken = String(searchParams.get('guestToken') ?? '');
  const customerPhone = String(searchParams.get('customerPhone') ?? '');

  if (!orderNumber) {
    return NextResponse.json({ error: 'Missing order number.' }, { status: 400 });
  }

  const supabase = createRouteClient();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;
  const adminSupabase = createServiceRoleClient();

  let requesterProfileId: string | null = null;
  if (authUser) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();
    requesterProfileId = profile?.id ?? null;
  }

  const { data: order, error } = await adminSupabase
    .from('orders')
    .select('order_number,payment_method,payment_status,order_status,customer_marked_paid,customer_marked_paid_at,total,customer_phone,customer_name,profile_id,created_at')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const tokenResult = guestToken ? verifyGuestOrderToken(guestToken, orderNumber) : { valid: false, customerPhone: null as string | null };
  const tokenMatched = tokenResult.valid && tokenResult.customerPhone === order.customer_phone;
  const phoneMatched = Boolean(customerPhone) && customerPhone === order.customer_phone;
  const signedInOwnerMatched = Boolean(requesterProfileId) && requesterProfileId === order.profile_id;

  if (!tokenMatched && !phoneMatched && !signedInOwnerMatched) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      order_number: order.order_number,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      customer_marked_paid: order.customer_marked_paid,
      customer_marked_paid_at: order.customer_marked_paid_at,
      total: order.total,
      customer_phone: order.customer_phone,
      customer_name: order.customer_name,
      created_at: order.created_at,
    },
  });
}

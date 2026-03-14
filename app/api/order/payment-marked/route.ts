import { NextResponse } from 'next/server';
import { createRouteClient, createServiceRoleClient } from '@/lib/supabase/server';
import { verifyGuestOrderToken } from '@/lib/order';

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = String(body.orderNumber ?? '');
  const guestToken = String(body.guestToken ?? '');
  const customerPhone = String(body.customerPhone ?? '');

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

  const { data: order, error: fetchError } = await adminSupabase
    .from('orders')
    .select('id,payment_method,payment_status,customer_marked_paid,customer_phone,profile_id')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const tokenResult = guestToken ? verifyGuestOrderToken(guestToken, orderNumber) : { valid: false, customerPhone: null as string | null };
  const tokenMatched = tokenResult.valid && tokenResult.customerPhone === order.customer_phone;
  const phoneMatched = Boolean(customerPhone) && customerPhone === order.customer_phone;
  const signedInOwnerMatched = Boolean(requesterProfileId) && requesterProfileId === order.profile_id;

  if (!tokenMatched && !phoneMatched && !signedInOwnerMatched) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.payment_method !== 'send_money' || order.payment_status !== 'pending') {
    return NextResponse.json({ ok: true, message: 'Payment is already being processed.' });
  }

  if (order.customer_marked_paid) {
    return NextResponse.json({ ok: true, message: 'Payment notification already sent.', alreadyMarked: true });
  }

  const { error } = await adminSupabase
    .from('orders')
    .update({ customer_marked_paid: true, customer_marked_paid_at: new Date().toISOString() })
    .eq('order_number', orderNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Payment notification sent.' });
}

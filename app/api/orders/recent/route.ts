export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createRouteClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createRouteClient();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;

  if (!authUser) {
    return NextResponse.json({ orders: [] });
  }

  const adminSupabase = createServiceRoleClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (!profile?.id) {
    return NextResponse.json({ orders: [] });
  }

  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('order_number,total,order_status,payment_status,payment_method,created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

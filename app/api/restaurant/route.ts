export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createRouteClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('name,delivery_fee,is_open,currency')
    .eq('slug', 'beirut-express')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Restaurant not found' }, { status: 500 });
  }

  return NextResponse.json(data);
}

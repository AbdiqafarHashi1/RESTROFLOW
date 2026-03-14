import { PaymentPendingLiveCard } from '@/components/public/payment-pending-live-card';
import { getRestaurant } from '@/lib/data';
import { createServerClient } from '@/lib/supabase/server';

export default async function OrderPendingPaymentPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; payment?: string; type?: string; wa?: string; paymentNumber?: string; restaurantPhone?: string; customerPhone?: string; guestToken?: string };
}) {
  const [restaurant, supabase] = await Promise.all([getRestaurant(), Promise.resolve(createServerClient())]);

  const { data: order } = await supabase
    .from('orders')
    .select('order_number,payment_method,payment_status,order_status,customer_marked_paid,customer_marked_paid_at')
    .eq('order_number', params.orderNumber)
    .single();

  const whatsappLink = searchParams.wa ?? `https://wa.me/${restaurant.whatsapp_number ?? ''}`;

  return (
    <main className="container-padding mx-auto max-w-xl py-6 md:py-8">
      <PaymentPendingLiveCard
        orderNumber={params.orderNumber}
        total={searchParams.total ?? ''}
        paymentNumber={searchParams.paymentNumber || restaurant.payment_number || ''}
        orderType={searchParams.type ?? ''}
        paymentMethod={searchParams.payment ?? 'send_money'}
        restaurantPhone={searchParams.restaurantPhone ?? restaurant.phone ?? ''}
        customerPhone={searchParams.customerPhone ?? ''}
        whatsappLink={whatsappLink}
        guestToken={searchParams.guestToken ?? ''}
        initialState={
          order ?? {
            order_number: params.orderNumber,
            payment_method: 'send_money',
            payment_status: 'pending',
            order_status: 'new',
            customer_marked_paid: false,
            customer_marked_paid_at: null,
          }
        }
      />
    </main>
  );
}

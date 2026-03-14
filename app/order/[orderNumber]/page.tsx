import { Navbar } from '@/components/public/navbar';
import { OrderTrackingCard } from '@/components/public/order-tracking-card';
import { getRestaurant } from '@/lib/data';

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { guestToken?: string; customerPhone?: string };
}) {
  const restaurant = await getRestaurant();

  return (
    <div>
      <Navbar restaurantName={restaurant.name} />
      <main className="container-padding mx-auto max-w-xl py-8">
        <p className="text-primary">Track your order</p>
        <h1 className="mt-2 font-heading text-4xl">Order #{params.orderNumber}</h1>
        <OrderTrackingCard
          orderNumber={params.orderNumber}
          initialToken={searchParams.guestToken}
          initialPhone={searchParams.customerPhone}
          restaurantPhone={restaurant.phone ?? ''}
        />
      </main>
    </div>
  );
}

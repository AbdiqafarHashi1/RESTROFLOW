import { StatsCard } from '@/components/admin/stats-card';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="section-title">Dashboard</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <StatsCard title="Total orders today" value="24" />
        <StatsCard title="Revenue today" value="KES 9,600" />
        <StatsCard title="New orders" value="6" />
        <StatsCard title="Active menu items" value="28" />
      </div>
    </div>
  );
}
